package admin

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct {
	bucket *storage.BucketHandle
}

func NewUploadHandler(bucket *storage.BucketHandle) *UploadHandler {
	return &UploadHandler{bucket: bucket}
}

var allowedMIMETypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

func (h *UploadHandler) UploadImage(c *gin.Context) {
	if h.bucket == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Firebase Storage is not configured. Set FIREBASE_STORAGE_BUCKET."})
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		// Fallback: try "file" field name too
		file, header, err = c.Request.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided. Use multipart/form-data with field name 'image'"})
			return
		}
	}
	defer file.Close()

	// Validate content type
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg"
	}
	contentType = strings.Split(contentType, ";")[0]
	contentType = strings.TrimSpace(contentType)

	if !allowedMIMETypes[contentType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only JPEG, PNG, WebP, and GIF images are allowed"})
		return
	}

	// Validate file size (max 20MB)
	if header.Size > 20*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size must not exceed 20MB"})
		return
	}

	// Generate unique filename and download token
	ext := "jpg"
	if parts := strings.Split(header.Filename, "."); len(parts) > 1 {
		ext = parts[len(parts)-1]
	}
	filename := fmt.Sprintf("uploads/%d-%s.%s", time.Now().Unix(), uuid.New().String(), ext)
	downloadToken := uuid.New().String()

	// Upload to Firebase Storage
	ctx := context.Background()
	obj := h.bucket.Object(filename)
	writer := obj.NewWriter(ctx)
	writer.ContentType = contentType
	writer.Metadata = map[string]string{
		"firebaseStorageDownloadTokens": downloadToken,
	}

	if _, err := io.Copy(writer, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write file to storage: " + err.Error()})
		return
	}
	if err := writer.Close(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to finish upload to storage: " + err.Error()})
		return
	}

	// Construct Firebase Storage public URL
	bucketName := os.Getenv("FIREBASE_STORAGE_BUCKET")
	// Firebase Storage URL format requires URL encoding the path (e.g. converting '/' to '%2F')
	encodedPath := strings.ReplaceAll(url.QueryEscape(filename), "+", "%20")
	firebaseURL := fmt.Sprintf("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s", bucketName, encodedPath, downloadToken)

	log.Printf("Uploaded file to: %s", firebaseURL)

	c.JSON(http.StatusOK, gin.H{"url": firebaseURL})
}
