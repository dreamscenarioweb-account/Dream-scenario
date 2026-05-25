package public

import (
	"context"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"captured-moments-backend/models"
)

type AlbumsHandler struct {
	client *firestore.Client
}

func NewAlbumsHandler(client *firestore.Client) *AlbumsHandler {
	return &AlbumsHandler{client: client}
}

func (h *AlbumsHandler) ListAlbums(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("albums").OrderBy("display_order", firestore.Asc).Documents(ctx)
	albums := []models.Album{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil { continue }
		var a models.Album
		if err := doc.DataTo(&a); err == nil {
			if a.IsPublished {
				a.ID = doc.Ref.ID
				albums = append(albums, a)
			}
		}
	}
	c.JSON(http.StatusOK, albums)
}

func (h *AlbumsHandler) GetAlbumBySlug(c *gin.Context) {
	slug := c.Param("slug")
	ctx := context.Background()

	iter := h.client.Collection("albums").Where("slug", "==", slug).Where("is_published", "==", true).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err == iterator.Done {
		c.JSON(http.StatusNotFound, gin.H{"error": "Album not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch album"})
		return
	}
	
	var a models.AlbumWithPhotos
	if err := doc.DataTo(&a.Album); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse album"})
		return
	}
	a.Album.ID = doc.Ref.ID

	// Fetch photos without OrderBy to avoid requiring composite index
	photosIter := h.client.Collection("photos").Where("album_id", "==", a.Album.ID).Documents(ctx)
	a.Photos = []models.Photo{}
	for {
		pDoc, err := photosIter.Next()
		if err == iterator.Done { break }
		if err != nil { continue }
		var p models.Photo
		if err := pDoc.DataTo(&p); err == nil {
			p.ID = pDoc.Ref.ID
			a.Photos = append(a.Photos, p)
		}
	}

	// Sort manually in Go
	for i := 0; i < len(a.Photos)-1; i++ {
		for j := i + 1; j < len(a.Photos); j++ {
			if a.Photos[i].DisplayOrder > a.Photos[j].DisplayOrder {
				a.Photos[i], a.Photos[j] = a.Photos[j], a.Photos[i]
			}
		}
	}

	c.JSON(http.StatusOK, a)
}

func (h *AlbumsHandler) ListCategories(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("album_categories").OrderBy("display_order", firestore.Asc).Documents(ctx)
	cats := []models.AlbumCategory{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil { continue }
		var cat models.AlbumCategory
		if err := doc.DataTo(&cat); err == nil {
			cat.ID = doc.Ref.ID
			cats = append(cats, cat)
		}
	}
	c.JSON(http.StatusOK, cats)
}
