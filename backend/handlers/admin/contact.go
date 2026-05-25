package admin

import (
	"context"
	"log"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"captured-moments-backend/models"
)

type ContactHandler struct {
	client *firestore.Client
}

func NewContactHandler(client *firestore.Client) *ContactHandler {
	return &ContactHandler{client: client}
}

// ── Quote Requests ────────────────────────────────────────────────────────────

func (h *ContactHandler) ListQuoteRequests(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("quote_requests").OrderBy("submitted_at", firestore.Desc).Documents(ctx)
	
	quotes := []models.QuoteRequest{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch quote requests"})
			return
		}
		var q models.QuoteRequest
		if err := doc.DataTo(&q); err == nil {
			q.ID = doc.Ref.ID
			quotes = append(quotes, q)
		}
	}
	c.JSON(http.StatusOK, quotes)
}

func (h *ContactHandler) MarkQuoteRead(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		IsRead bool `json:"is_read"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	ctx := context.Background()
	_, err := h.client.Collection("quote_requests").Doc(id).Update(ctx, []firestore.Update{
		{Path: "is_read", Value: body.IsRead},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update quote request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"is_read": body.IsRead})
}

func (h *ContactHandler) DeleteQuoteRequest(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()
	_, err := h.client.Collection("quote_requests").Doc(id).Delete(ctx)
	if err != nil {
		log.Printf("Error deleting quote request (ID: %s): %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete quote request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Quote request deleted successfully"})
}

// ── Contact Submissions ───────────────────────────────────────────────────────

func (h *ContactHandler) ListContactSubmissions(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("contact_submissions").OrderBy("submitted_at", firestore.Desc).Documents(ctx)
	
	contacts := []models.ContactSubmission{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contact submissions"})
			return
		}
		var cs models.ContactSubmission
		if err := doc.DataTo(&cs); err == nil {
			cs.ID = doc.Ref.ID
			contacts = append(contacts, cs)
		}
	}
	c.JSON(http.StatusOK, contacts)
}

func (h *ContactHandler) MarkContactRead(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		IsRead bool `json:"is_read"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	ctx := context.Background()
	_, err := h.client.Collection("contact_submissions").Doc(id).Update(ctx, []firestore.Update{
		{Path: "is_read", Value: body.IsRead},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update contact submission"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"is_read": body.IsRead})
}

func (h *ContactHandler) DeleteContactSubmission(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()
	_, err := h.client.Collection("contact_submissions").Doc(id).Delete(ctx)
	if err != nil {
		log.Printf("Error deleting contact submission (ID: %s): %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete contact submission"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Contact submission deleted successfully"})
}
