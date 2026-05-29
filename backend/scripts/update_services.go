package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"captured-moments-backend/db"

	"github.com/joho/godotenv"
	"google.golang.org/api/iterator"
)

func main() {
	_ = godotenv.Load()

	firebaseDB := db.InitFirebase()
	ctx := context.Background()
	client := firebaseDB.Client

	log.Println("Updating services collection in Firestore...")

	// 1. Delete all existing services
	iter := client.Collection("services").Documents(ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("Error iterating services: %v", err)
		}
		_, err = doc.Ref.Delete(ctx)
		if err != nil {
			log.Fatalf("Failed to delete service doc %s: %v", doc.Ref.ID, err)
		}
		fmt.Printf("Deleted service doc: %s\n", doc.Ref.ID)
	}
	fmt.Println("All existing services deleted.")

	// 2. Define the 6 new services with icons and sayings
	newServices := []map[string]interface{}{
		{
			"title":       "Weddings",
			"icon_name":   "Heart",
			"image_url":   "placeholder",
			"description": "Every love story is unique and deserves to be told in its own beautiful way. We capture the grand moments and the quiet whispers that make your wedding day yours.",
			"features": []string{
				"Full day coverage (8-12 hours)",
				"Two professional lead photographers",
				"Private online gallery for sharing",
				"500+ high-resolution edited images",
			},
			"display_order": 1,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"title":       "Engagements",
			"icon_name":   "Gem",
			"image_url":   "placeholder",
			"description": "Celebrate the beginning of your forever. We create romantic, warm, and natural engagement sessions that capture the excitement of your promise.",
			"features": []string{
				"1-2 hour session at chosen location",
				"Style & wardrobe consultation",
				"Online gallery download in 2 weeks",
				"80+ high-resolution edited images",
			},
			"display_order": 2,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"title":       "Casual Shoots",
			"icon_name":   "Camera",
			"image_url":   "placeholder",
			"description": "Relaxed and fun lifestyle sessions. Whether in a cozy café or a sun-drenched park, we capture you being completely, beautifully yourselves.",
			"features": []string{
				"Casual outdoor lifestyle shoot",
				"Candid, unposed direction",
				"Digital high-resolution delivery",
				"Perfect for anniversaries or lifestyle portraits",
			},
			"display_order": 3,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"title":       "Homecomings",
			"icon_name":   "PartyPopper",
			"image_url":   "placeholder",
			"description": "Immortalize the joy of your return and reception. We document the celebrations, the dances, and the laughter as you share your happiness with family and friends.",
			"features": []string{
				"Reception and homecoming traditions coverage",
				"Candid moments and guest portraits",
				"Fast turnaround preview (within 48 hours)",
				"Full high-res digital gallery",
			},
			"display_order": 4,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"title":       "Cinematography",
			"icon_name":   "Video",
			"image_url":   "placeholder",
			"description": "Moving stories that take your breath away. Our high-end, cinematic video coverage captures the sound, motion, and emotion of your celebration in a stunning highlight film.",
			"features": []string{
				"4K cinematic highlight film (4-6 minutes)",
				"Professional multi-source audio capture",
				"Drone aerial videography (weather permitting)",
				"Full documentary edit of ceremony & speeches",
			},
			"display_order": 5,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"title":       "Photobooths",
			"icon_name":   "Smile",
			"image_url":   "placeholder",
			"description": "Fun, interactive, and memorable. Add a touch of excitement to your event with professional studio lighting, custom backdrops, and instant high-quality printouts.",
			"features": []string{
				"Open-air photobooth with studio light",
				"Custom print template design",
				"On-site assistant & fun props",
				"Instant printouts & digital sharing gallery",
			},
			"display_order": 6,
			"is_active":     true,
			"created_at":    time.Now(),
		},
	}

	// 3. Write them to Firestore
	for _, svc := range newServices {
		docRef := client.Collection("services").NewDoc()
		svc["id"] = docRef.ID
		if _, err := docRef.Set(ctx, svc); err != nil {
			log.Fatalf("ERROR seeding service: %v\n", err)
		}
		fmt.Printf("Seeded service '%s' with ID %s\n", svc["title"], docRef.ID)
	}

	fmt.Println("\nServices successfully updated to 6 icon-based items!")
}
