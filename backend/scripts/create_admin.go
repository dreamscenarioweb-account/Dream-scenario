package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"captured-moments-backend/db"
	"golang.org/x/crypto/bcrypt"

	"github.com/joho/godotenv"
)

func main() {
	// Try to load .env if it exists
	_ = godotenv.Load()

	// Initialize Firebase connection
	firebaseDB := db.InitFirebase()
	ctx := context.Background()

	email := "admin@capturedmoments.com"
	password := "AdminAuth2026"
	name := "Main Admin"

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Insert into Firestore
	// Using a specific doc ID or autogenerating. Autogenerating is fine.
	docRef, _, err := firebaseDB.Client.Collection("admin_users").Add(ctx, map[string]interface{}{
		"email":         email,
		"password_hash": string(hash),
		"name":          name,
		"created_at":    time.Now(),
		"last_login_at": nil,
	})

	if err != nil {
		log.Fatalf("Failed to insert admin user into Firestore: %v", err)
	}

	fmt.Printf("\n--- SUCCESS ---\n")
	fmt.Printf("Admin User Created!\n")
	fmt.Printf("Document ID: %s\n", docRef.ID)
	fmt.Printf("Email: %s\n", email)
	fmt.Printf("Password: %s\n", password)
	fmt.Printf("-----------------\n")
}
