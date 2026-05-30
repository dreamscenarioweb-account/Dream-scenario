package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"

	"captured-moments-backend/db"
	adminHandlers "captured-moments-backend/handlers/admin"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Initializing Firebase...")
	firebaseDB := db.InitFirebase()
	h := adminHandlers.NewCMSHandler(firebaseDB.Client, firebaseDB.StorageBucket)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.PUT("/admin/showcase/:id", h.UpdateShowcaseItem)

	// Create a mock request payload
	payload := map[string]interface{}{
		"image_url":     "https://firebasestorage.googleapis.com/v0/b/beyondweddingspro.firebasestorage.app/o/uploads%2F1780135363-ba355d3a-6d17-4df7-bcf6-1da13fb6c5e7.jpg?alt=media&token=2be9fccc-52e9-4aaf-ae13-a59b154b09ee",
		"title":         "Veronika & Jakub",
		"category":      "wedding",
		"display_order": 3,
		"is_active":     false,
	}

	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPut, "/admin/showcase/wNUOIi1jWifsm8ciprdW", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	fmt.Printf("Response Status: %d\n", w.Code)
	fmt.Printf("Response Body: %s\n", w.Body.String())
}
