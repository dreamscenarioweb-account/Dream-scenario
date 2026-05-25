package db

import (
	"context"
	"log"
	"os"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

type FirebaseDB struct {
	App           *firebase.App
	Client        *firestore.Client
	StorageBucket *storage.BucketHandle
}

func InitFirebase() *FirebaseDB {
	ctx := context.Background()

	credFile := "serviceAccountKey.json"
	
	// Check if FIREBASE_STORAGE_BUCKET environment variable is set
	bucketName := os.Getenv("FIREBASE_STORAGE_BUCKET")
	if bucketName == "" {
		// Log a warning if not set, as image uploads will fail
		log.Println("WARNING: FIREBASE_STORAGE_BUCKET environment variable is not set. Image uploads will fail.")
	}

	config := &firebase.Config{
		StorageBucket: bucketName,
	}

	var app *firebase.App
	var err error

	firebaseCredsJSON := os.Getenv("FIREBASE_CREDENTIALS")

	if firebaseCredsJSON != "" {
		opt := option.WithCredentialsJSON([]byte(firebaseCredsJSON))
		app, err = firebase.NewApp(ctx, config, opt)
		log.Println("Firebase initialized using FIREBASE_CREDENTIALS environment variable")
	} else {
		// On Render, secret files can be mounted to /etc/secrets/
		if _, err := os.Stat("/etc/secrets/serviceAccountKey.json"); err == nil {
			credFile = "/etc/secrets/serviceAccountKey.json"
		}

		_, statErr := os.Stat(credFile)
		if statErr == nil {
			opt := option.WithCredentialsFile(credFile)
			app, err = firebase.NewApp(ctx, config, opt)
			log.Println("Firebase initialized using", credFile)
		} else {
			// Fallback to Application Default Credentials
			app, err = firebase.NewApp(ctx, config)
			log.Println("Firebase initialized using Application Default Credentials")
		}
	}

	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("error getting firestore client: %v\n", err)
	}

	var bucket *storage.BucketHandle
	if bucketName != "" {
		storageClient, err := app.Storage(ctx)
		if err != nil {
			log.Fatalf("error getting storage client: %v\n", err)
		}
		bucket, err = storageClient.DefaultBucket()
		if err != nil {
			log.Fatalf("error getting default bucket: %v\n", err)
		}
	}

	return &FirebaseDB{
		App:           app,
		Client:        client,
		StorageBucket: bucket,
	}
}
