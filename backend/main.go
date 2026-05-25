package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-gonic/gin"

	"captured-moments-backend/db"
	adminHandlers "captured-moments-backend/handlers/admin"
	publicHandlers "captured-moments-backend/handlers/public"
	"captured-moments-backend/middleware"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or error loading it. Using environment variables.")
	}
	// Initialize Firebase DB connection
	log.Println("Initializing Firebase...")
	firebaseDB := db.InitFirebase()

	// Setup Gin router
	r := gin.Default()

	// Simple CORS middleware
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Create Firebase Auth Client
	ctx := context.Background()
	authClient, err := firebaseDB.App.Auth(ctx)
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	adminAlbumsHandler := adminHandlers.NewAlbumsHandler(firebaseDB.Client, firebaseDB.StorageBucket)
	adminCMSHandler := adminHandlers.NewCMSHandler(firebaseDB.Client, firebaseDB.StorageBucket)
	adminContactHandler := adminHandlers.NewContactHandler(firebaseDB.Client)
	adminUploadHandler := adminHandlers.NewUploadHandler(firebaseDB.StorageBucket)

	publicAlbumsHandler := publicHandlers.NewAlbumsHandler(firebaseDB.Client)
	publicCMSHandler := publicHandlers.NewCMSHandler(firebaseDB.Client)
	publicContactHandler := publicHandlers.NewContactHandler(firebaseDB.Client)

	// -- API Routes --
	api := r.Group("/api")
	{
		// Public Routes
		api.POST("/contact", publicContactHandler.SubmitContact)
		api.POST("/quote-request", publicContactHandler.SubmitQuote)

		// Public CMS
		api.GET("/hero-slides", publicCMSHandler.GetHeroSlides)
		api.GET("/testimonials", publicCMSHandler.GetTestimonials)
		api.GET("/showcase", publicCMSHandler.GetShowcaseItems)
		api.GET("/services", publicCMSHandler.GetServices)
		api.GET("/settings", publicCMSHandler.GetSettings)
		api.GET("/team-members", publicCMSHandler.GetTeamMembers)
		api.GET("/blog-posts", publicCMSHandler.GetBlogPosts)

		// Public Albums
		api.GET("/albums", publicAlbumsHandler.ListAlbums)
		api.GET("/albums/:slug", publicAlbumsHandler.GetAlbumBySlug)
		api.GET("/album-categories", publicAlbumsHandler.ListCategories)

		// Admin Routes
		admin := api.Group("/admin")
		{
			// Protected Admin Routes
			protected := admin.Group("/")
			protected.Use(middleware.RequireAuth(authClient))
			{
				// Albums
				protected.GET("/albums", adminAlbumsHandler.ListAlbums)
				protected.POST("/albums", adminAlbumsHandler.CreateAlbum)
				protected.PUT("/albums/:id", adminAlbumsHandler.UpdateAlbum)
				protected.DELETE("/albums/:id", adminAlbumsHandler.DeleteAlbum)

				protected.GET("/albums/:id/photos", adminAlbumsHandler.GetAlbumPhotos)
				protected.POST("/albums/:id/photos", adminAlbumsHandler.AddPhoto)
				protected.DELETE("/photos/:photoId", adminAlbumsHandler.DeletePhoto)
				protected.PUT("/albums/:id/photos/reorder", adminAlbumsHandler.ReorderPhotos)

				// Categories
				protected.GET("/album-categories", adminAlbumsHandler.ListCategories)
				protected.POST("/album-categories", adminAlbumsHandler.CreateCategory)
				protected.PUT("/album-categories/:id", adminAlbumsHandler.UpdateCategory)
				protected.DELETE("/album-categories/:id", adminAlbumsHandler.DeleteCategory)

				// CMS - Hero Slides
				protected.GET("/hero-slides", adminCMSHandler.ListHeroSlides)
				protected.POST("/hero-slides", adminCMSHandler.CreateHeroSlide)
				protected.PUT("/hero-slides/:id", adminCMSHandler.UpdateHeroSlide)
				protected.DELETE("/hero-slides/:id", adminCMSHandler.DeleteHeroSlide)

				// CMS - Testimonials
				protected.GET("/testimonials", adminCMSHandler.ListTestimonials)
				protected.POST("/testimonials", adminCMSHandler.CreateTestimonial)
				protected.PUT("/testimonials/:id", adminCMSHandler.UpdateTestimonial)
				protected.DELETE("/testimonials/:id", adminCMSHandler.DeleteTestimonial)

				// CMS - Showcase
				protected.GET("/showcase", adminCMSHandler.ListShowcaseItems)
				protected.POST("/showcase", adminCMSHandler.CreateShowcaseItem)
				protected.PUT("/showcase/:id", adminCMSHandler.UpdateShowcaseItem)
				protected.DELETE("/showcase/:id", adminCMSHandler.DeleteShowcaseItem)

				// CMS - Team Members
				protected.GET("/team-members", adminCMSHandler.ListTeamMembers)
				protected.POST("/team-members", adminCMSHandler.CreateTeamMember)
				protected.PUT("/team-members/:id", adminCMSHandler.UpdateTeamMember)
				protected.DELETE("/team-members/:id", adminCMSHandler.DeleteTeamMember)

				// CMS - Services
				protected.GET("/services", adminCMSHandler.ListServices)
				protected.POST("/services", adminCMSHandler.CreateService)
				protected.PUT("/services/:id", adminCMSHandler.UpdateService)
				protected.DELETE("/services/:id", adminCMSHandler.DeleteService)

				// CMS - Blog Posts
				protected.GET("/blog-posts", adminCMSHandler.ListBlogPosts)
				protected.POST("/blog-posts", adminCMSHandler.CreateBlogPost)
				protected.PUT("/blog-posts/:id", adminCMSHandler.UpdateBlogPost)
				protected.DELETE("/blog-posts/:id", adminCMSHandler.DeleteBlogPost)

				// CMS - Settings
				protected.GET("/settings", adminCMSHandler.GetSettings)
				protected.PATCH("/settings", adminCMSHandler.UpdateSettings)

				// Contact & Quotes
				protected.GET("/contact-submissions", adminContactHandler.ListContactSubmissions)
				protected.PATCH("/contact-submissions/:id/read", adminContactHandler.MarkContactRead)
				protected.DELETE("/contact-submissions/:id", adminContactHandler.DeleteContactSubmission)

				protected.GET("/quote-requests", adminContactHandler.ListQuoteRequests)
				protected.PATCH("/quote-requests/:id/read", adminContactHandler.MarkQuoteRead)
				protected.DELETE("/quote-requests/:id", adminContactHandler.DeleteQuoteRequest)

				// Uploads
				protected.POST("/upload", adminUploadHandler.UploadImage)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Starting server on port %s", port)
	r.Run(":" + port)
}
