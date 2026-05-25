package public

import (
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"

	"captured-moments-backend/models"
)

type ContactHandler struct {
	client *firestore.Client
}

func NewContactHandler(client *firestore.Client) *ContactHandler {
	return &ContactHandler{client: client}
}

func (h *ContactHandler) SubmitContact(c *gin.Context) {
	var req models.ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	docRef := h.client.Collection("contact_submissions").NewDoc()
	submission := models.ContactSubmission{
		ID:          docRef.ID,
		Name:        req.Name,
		Email:       req.Email,
		Phone:       req.Phone,
		WeddingDate: nil,
		Venue:       req.Venue,
		Message:     req.Message,
		IsRead:      false,
		SubmittedAt: time.Now(),
	}
	if req.WeddingDate != "" {
		submission.WeddingDate = &req.WeddingDate
	}

	if _, err := docRef.Set(context.Background(), submission); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save submission"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Submission received"})
}

func (h *ContactHandler) SubmitQuote(c *gin.Context) {
	var req models.QuoteRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	docRef := h.client.Collection("quote_requests").NewDoc()
	quote := models.QuoteRequest{
		ID:          docRef.ID,
		Names:       req.Names,
		Email:       req.Email,
		Phone:       req.Phone,
		EventType:   req.EventType,
		EventDate:   nil,
		EventVenue:  req.EventVenue,
		Budget:      req.Budget,
		HearAboutUs: req.HearAboutUs,
		Message:     req.Message,
		IsRead:      false,
		SubmittedAt: time.Now(),
	}
	if req.EventDate != "" {
		quote.EventDate = &req.EventDate
	}

	if _, err := docRef.Set(context.Background(), quote); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save quote request"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Quote request received"})
}
