package admin

import (
	"context"
	"log"
	"net/url"
	"strings"

	"cloud.google.com/go/storage"
)

// DeleteFirebaseImage parses a Firebase Storage HTTP URL, extracts the object path,
// and deletes the corresponding object from the Cloud Storage bucket.
func DeleteFirebaseImage(bucket *storage.BucketHandle, imageURL string) {
	if bucket == nil || imageURL == "" {
		return
	}

	u, err := url.Parse(imageURL)
	if err != nil {
		log.Println("Error parsing image URL for deletion:", err)
		return
	}

	// Firebase storage HTTP URLs have the format:
	// /v0/b/<bucket-name>/o/<encoded-object-path>
	parts := strings.Split(u.Path, "/o/")
	if len(parts) < 2 {
		return
	}

	objectPath, err := url.PathUnescape(parts[1])
	if err != nil {
		log.Println("Error unescaping object path:", err)
		return
	}

	err = bucket.Object(objectPath).Delete(context.Background())
	if err != nil {
		log.Println("Warning: Failed to delete object from Firebase Storage:", err)
	} else {
		log.Println("Successfully deleted object from Firebase Storage:", objectPath)
	}
}
