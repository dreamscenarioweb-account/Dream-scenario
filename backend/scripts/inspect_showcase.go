package main

import (
	"context"
	"fmt"
	"log"

	"captured-moments-backend/db"
	"google.golang.org/api/iterator"
)

func main() {
	log.Println("Initializing Firebase in script...")
	firebaseDB := db.InitFirebase()
	ctx := context.Background()

	log.Println("Fetching showcase_items documents...")
	iter := firebaseDB.Client.Collection("showcase_items").Documents(ctx)

	count := 0
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("Error iterating: %v", err)
		}
		count++
		fmt.Printf("Doc ID: %s\n", doc.Ref.ID)
		fmt.Printf("Data: %v\n", doc.Data())
		fmt.Println("----------------------------------------")
	}
	fmt.Printf("Total documents found: %d\n", count)
}
