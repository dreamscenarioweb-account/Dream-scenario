package admin

import (
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"captured-moments-backend/models"
)

type AlbumsHandler struct {
	client *firestore.Client
	bucket *storage.BucketHandle
}

func NewAlbumsHandler(client *firestore.Client, bucket *storage.BucketHandle) *AlbumsHandler {
	return &AlbumsHandler{client: client, bucket: bucket}
}

// ── Albums ─────────────────────────────────────────────────────────────

func (h *AlbumsHandler) ListAlbums(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("albums").OrderBy("display_order", firestore.Asc).Documents(ctx)
	albums := []models.Album{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch albums"})
			return
		}
		var a models.Album
		if err := doc.DataTo(&a); err == nil {
			a.ID = doc.Ref.ID
			albums = append(albums, a)
		}
	}
	c.JSON(http.StatusOK, albums)
}

func (h *AlbumsHandler) CreateAlbum(c *gin.Context) {
	var req models.CreateAlbumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	
	// Check if slug exists
	slugIter := h.client.Collection("albums").Where("slug", "==", req.Slug).Limit(1).Documents(ctx)
	if _, err := slugIter.Next(); err != iterator.Done {
		c.JSON(http.StatusConflict, gin.H{"error": "An album with this slug already exists"})
		return
	}

	docRef := h.client.Collection("albums").NewDoc()
	album := models.Album{
		ID:             docRef.ID,
		Title:          req.Title,
		Slug:           req.Slug,
		Category:       req.Category,
		CoverImageURL:  req.CoverImageURL,
		DisplayOrder:   req.DisplayOrder,
		IsPublished:    req.IsPublished,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if _, err := docRef.Set(ctx, album); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create album"})
		return
	}

	c.JSON(http.StatusCreated, album)
}

func (h *AlbumsHandler) UpdateAlbum(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateAlbumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	docRef := h.client.Collection("albums").Doc(id)

	updates := []firestore.Update{
		{Path: "updated_at", Value: time.Now()},
	}
	if req.Title != "" { updates = append(updates, firestore.Update{Path: "title", Value: req.Title}) }
	if req.Slug != "" { updates = append(updates, firestore.Update{Path: "slug", Value: req.Slug}) }
	if req.Category != "" { updates = append(updates, firestore.Update{Path: "category", Value: req.Category}) }
	if req.CoverImageURL != "" { updates = append(updates, firestore.Update{Path: "cover_image_url", Value: req.CoverImageURL}) }
	if req.DisplayOrder != 0 { updates = append(updates, firestore.Update{Path: "display_order", Value: req.DisplayOrder}) }
	if req.IsPublished != nil { updates = append(updates, firestore.Update{Path: "is_published", Value: *req.IsPublished}) }

	if _, err := docRef.Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update album"})
		return
	}

	docSnap, _ := docRef.Get(ctx)
	var album models.Album
	docSnap.DataTo(&album)
	album.ID = docSnap.Ref.ID

	c.JSON(http.StatusOK, album)
}

func (h *AlbumsHandler) DeleteAlbum(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()
	
	// Fetch the album to get its cover image URL
	docSnap, err := h.client.Collection("albums").Doc(id).Get(ctx)
	if err == nil {
		var a models.Album
		if docSnap.DataTo(&a) == nil {
			DeleteFirebaseImage(h.bucket, a.CoverImageURL)
		}
	}

	// Delete related photos in Firestore and Storage
	photosIter := h.client.Collection("photos").Where("album_id", "==", id).Documents(ctx)
	for {
		doc, err := photosIter.Next()
		if err == iterator.Done { break }
		if err == nil {
			var p models.Photo
			if doc.DataTo(&p) == nil {
				DeleteFirebaseImage(h.bucket, p.URL)
			}
			doc.Ref.Delete(ctx)
		}
	}

	if _, err := h.client.Collection("albums").Doc(id).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete album"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Album deleted"})
}

// ── Photos ─────────────────────────────────────────────────────────────

func (h *AlbumsHandler) AddPhoto(c *gin.Context) {
	albumID := c.Param("id")

	var req models.AddPhotoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()

	docRef := h.client.Collection("photos").NewDoc()
	photo := models.Photo{
		ID:           docRef.ID,
		AlbumID:      albumID,
		URL:          req.URL,
		AltText:      req.AltText,
		DisplayOrder: req.DisplayOrder,
		CreatedAt:    time.Now(),
	}

	if _, err := docRef.Set(ctx, photo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add photo"})
		return
	}

	c.JSON(http.StatusCreated, photo)
}

func (h *AlbumsHandler) DeletePhoto(c *gin.Context) {
	photoID := c.Param("photoId")
	ctx := context.Background()

	// Fetch photo to get its image URL
	docSnap, err := h.client.Collection("photos").Doc(photoID).Get(ctx)
	if err == nil {
		var p models.Photo
		if docSnap.DataTo(&p) == nil {
			DeleteFirebaseImage(h.bucket, p.URL)
		}
	}

	if _, err := h.client.Collection("photos").Doc(photoID).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete photo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Photo deleted"})
}

func (h *AlbumsHandler) GetAlbumPhotos(c *gin.Context) {
	albumID := c.Param("id")
	ctx := context.Background()

	// Fetch without OrderBy to avoid composite index requirement
	iter := h.client.Collection("photos").Where("album_id", "==", albumID).Documents(ctx)
	photos := []models.Photo{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch photos"})
			return
		}
		var p models.Photo
		if err := doc.DataTo(&p); err == nil {
			p.ID = doc.Ref.ID
			photos = append(photos, p)
		}
	}

	// Sort manually
	for i := 0; i < len(photos)-1; i++ {
		for j := i + 1; j < len(photos); j++ {
			if photos[i].DisplayOrder > photos[j].DisplayOrder {
				photos[i], photos[j] = photos[j], photos[i]
			}
		}
	}

	c.JSON(http.StatusOK, photos)
}

func (h *AlbumsHandler) ReorderPhotos(c *gin.Context) {
	var req models.ReorderPhotosRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	batch := h.client.Batch()

	for _, p := range req.Photos {
		docRef := h.client.Collection("photos").Doc(p.ID)
		batch.Update(docRef, []firestore.Update{
			{Path: "display_order", Value: p.DisplayOrder},
		})
	}

	if _, err := batch.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reorder photos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Photos reordered"})
}

// ── Album Categories ──────────────────────────────────────────────────────────

func (h *AlbumsHandler) ListCategories(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("album_categories").OrderBy("display_order", firestore.Asc).Documents(ctx)
	cats := []models.AlbumCategory{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
			return
		}
		var cat models.AlbumCategory
		if err := doc.DataTo(&cat); err == nil {
			cat.ID = doc.Ref.ID
			cats = append(cats, cat)
		}
	}
	c.JSON(http.StatusOK, cats)
}

func (h *AlbumsHandler) CreateCategory(c *gin.Context) {
	var req models.AlbumCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	docRef := h.client.Collection("album_categories").NewDoc()
	cat := models.AlbumCategory{
		ID:           docRef.ID,
		Name:         req.Name,
		DisplayOrder: req.DisplayOrder,
		CreatedAt:    time.Now(),
	}

	if _, err := docRef.Set(ctx, cat); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}
	c.JSON(http.StatusCreated, cat)
}

func (h *AlbumsHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var req models.AlbumCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	docRef := h.client.Collection("album_categories").Doc(id)

	if _, err := docRef.Update(ctx, []firestore.Update{
		{Path: "name", Value: req.Name},
		{Path: "display_order", Value: req.DisplayOrder},
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	docSnap, _ := docRef.Get(ctx)
	var cat models.AlbumCategory
	docSnap.DataTo(&cat)
	cat.ID = docSnap.Ref.ID
	c.JSON(http.StatusOK, cat)
}

func (h *AlbumsHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	// Get category name
	docSnap, err := h.client.Collection("album_categories").Doc(id).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}
	var cat models.AlbumCategory
	docSnap.DataTo(&cat)

	// Guard: refuse if any albums use this category
	albumsIter := h.client.Collection("albums").Where("category", "==", cat.Name).Limit(1).Documents(ctx)
	if _, err := albumsIter.Next(); err != iterator.Done {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Cannot delete — album(s) are using this category. Reassign them first.",
		})
		return
	}

	if _, err := h.client.Collection("album_categories").Doc(id).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}
