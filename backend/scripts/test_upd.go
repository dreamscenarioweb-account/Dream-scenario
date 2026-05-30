package main

import (
	"context"
	"fmt"
	"log"

	"captured-moments-backend/db"
	"cloud.google.com/go/firestore"
)

func main() {
	log.Println("Initializing Firebase...")
	firebaseDB := db.InitFirebase()
	ctx := context.Background()

	// Try updating the document "wNUOIi1jWifsm8ciprdW"
	id := "wNUOIi1jWifsm8ciprdW"
	docRef := firebaseDB.Client.Collection("showcase_items").Doc(id)

	updates := []firestore.Update{
		{Path: "display_order", Value: 5},
		{Path: "is_active", Value: true},
	}

	log.Printf("Updating document %s in Firestore...", id)
	_, err := docRef.Update(ctx, updates)
	if err != nil {
		log.Fatalf("Firestore Update failed: %v", err)
	}

	log.Println("Firestore Update succeeded!")

	// Let's get the document to verify
	docSnap, err := docRef.Get(ctx)
	if err != nil {
		log.Fatalf("Get failed: %v", err)
	}

	fmt.Printf("Updated Data: %v\n", docSnap.Data())
}
