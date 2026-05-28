package admin

import (
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"captured-moments-backend/models"
)

type CMSHandler struct {
	client *firestore.Client
	bucket *storage.BucketHandle
}

func NewCMSHandler(client *firestore.Client, bucket *storage.BucketHandle) *CMSHandler {
	return &CMSHandler{client: client, bucket: bucket}
}

// ── Hero Slides ───────────────────────────────────────────────────────────────

func (h *CMSHandler) ListHeroSlides(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("hero_slides").OrderBy("display_order", firestore.Asc).Documents(ctx)
	slides := []models.HeroSlide{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch hero slides"})
			return
		}
		var s models.HeroSlide
		if err := doc.DataTo(&s); err == nil {
			s.ID = doc.Ref.ID
			slides = append(slides, s)
		}
	}
	c.JSON(http.StatusOK, slides)
}

func (h *CMSHandler) CreateHeroSlide(c *gin.Context) {
	var req models.HeroSlideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	docRef := h.client.Collection("hero_slides").NewDoc()
	s := models.HeroSlide{
		ID:           docRef.ID,
		ImageURL:     req.ImageURL,
		AltText:      req.AltText,
		DisplayOrder: req.DisplayOrder,
		IsActive:     isActive,
		CreatedAt:    time.Now(),
	}

	if _, err := docRef.Set(context.Background(), s); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create hero slide: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, s)
}

func (h *CMSHandler) UpdateHeroSlide(c *gin.Context) {
	id := c.Param("id")
	var req models.HeroSlideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	docRef := h.client.Collection("hero_slides").Doc(id)
	
	updates := []firestore.Update{}
	if req.ImageURL != "" { updates = append(updates, firestore.Update{Path: "image_url", Value: req.ImageURL}) }
	updates = append(updates, firestore.Update{Path: "alt_text", Value: req.AltText})
	updates = append(updates, firestore.Update{Path: "display_order", Value: req.DisplayOrder})
	if req.IsActive != nil { updates = append(updates, firestore.Update{Path: "is_active", Value: *req.IsActive}) }

	if _, err := docRef.Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update hero slide"})
		return
	}
	
	docSnap, _ := docRef.Get(ctx)
	var s models.HeroSlide
	docSnap.DataTo(&s)
	s.ID = docSnap.Ref.ID
	c.JSON(http.StatusOK, s)
}

func (h *CMSHandler) DeleteHeroSlide(c *gin.Context) {
	id := c.Param("id")
	
	// Fetch slide first to get imageURL
	ctx := context.Background()
	docSnap, err := h.client.Collection("hero_slides").Doc(id).Get(ctx)
	if err == nil {
		var s models.HeroSlide
		if docSnap.DataTo(&s) == nil {
			DeleteFirebaseImage(h.bucket, s.ImageURL)
		}
	}

	if _, err := h.client.Collection("hero_slides").Doc(id).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete hero slide"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Hero slide deleted"})
}

// ── Testimonials ──────────────────────────────────────────────────────────────

func (h *CMSHandler) ListTestimonials(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("testimonials").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.Testimonial{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch testimonials"})
			return
		}
		var s models.Testimonial
		if err := doc.DataTo(&s); err == nil {
			s.ID = doc.Ref.ID
			items = append(items, s)
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) CreateTestimonial(c *gin.Context) {
	var req models.TestimonialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isActive := true
	if req.IsActive != nil { isActive = *req.IsActive }
	rating := req.Rating
	if rating == 0 { rating = 5 }

	docRef := h.client.Collection("testimonials").NewDoc()
	s := models.Testimonial{
		ID:           docRef.ID,
		ImageURL:     req.ImageURL,
		Quote:        req.Quote,
		Couple:       req.Couple,
		Location:     req.Location,
		Rating:       rating,
		DisplayOrder: req.DisplayOrder,
		IsActive:     isActive,
		CreatedAt:    time.Now(),
	}

	if _, err := docRef.Set(context.Background(), s); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create testimonial"})
		return
	}
	c.JSON(http.StatusCreated, s)
}

func (h *CMSHandler) UpdateTestimonial(c *gin.Context) {
	id := c.Param("id")
	var req models.TestimonialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	docRef := h.client.Collection("testimonials").Doc(id)
	
	updates := []firestore.Update{}
	if req.ImageURL != "" { updates = append(updates, firestore.Update{Path: "image_url", Value: req.ImageURL}) }
	if req.Quote != "" { updates = append(updates, firestore.Update{Path: "quote", Value: req.Quote}) }
	if req.Couple != "" { updates = append(updates, firestore.Update{Path: "couple", Value: req.Couple}) }
	if req.Location != "" { updates = append(updates, firestore.Update{Path: "location", Value: req.Location}) }
	if req.Rating != 0 { updates = append(updates, firestore.Update{Path: "rating", Value: req.Rating}) }
	updates = append(updates, firestore.Update{Path: "display_order", Value: req.DisplayOrder})
	if req.IsActive != nil { updates = append(updates, firestore.Update{Path: "is_active", Value: *req.IsActive}) }

	if _, err := docRef.Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update testimonial"})
		return
	}
	
	docSnap, _ := docRef.Get(ctx)
	var s models.Testimonial
	docSnap.DataTo(&s)
	s.ID = docSnap.Ref.ID
	c.JSON(http.StatusOK, s)
}

func (h *CMSHandler) DeleteTestimonial(c *gin.Context) {
	id := c.Param("id")
	
	// Fetch testimonial first to get imageURL
	ctx := context.Background()
	docSnap, err := h.client.Collection("testimonials").Doc(id).Get(ctx)
	if err == nil {
		var s models.Testimonial
		if docSnap.DataTo(&s) == nil {
			DeleteFirebaseImage(h.bucket, s.ImageURL)
		}
	}

	if _, err := h.client.Collection("testimonials").Doc(id).Delete(context.Background()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete testimonial"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Testimonial deleted"})
}

// ── Showcase Items ────────────────────────────────────────────────────────────

func (h *CMSHandler) ListShowcaseItems(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("showcase_items").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.ShowcaseItem{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch showcase items"})
			return
		}
		var s models.ShowcaseItem
		if err := doc.DataTo(&s); err == nil {
			s.ID = doc.Ref.ID
			items = append(items, s)
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) CreateShowcaseItem(c *gin.Context) {
	var req models.ShowcaseItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isActive := true
	if req.IsActive != nil { isActive = *req.IsActive }

	docRef := h.client.Collection("showcase_items").NewDoc()
	s := models.ShowcaseItem{
		ID:           docRef.ID,
		ImageURL:     req.ImageURL,
		Title:        req.Title,
		Category:     req.Category,
		DisplayOrder: req.DisplayOrder,
		IsActive:     isActive,
		CreatedAt:    time.Now(),
	}

	if _, err := docRef.Set(context.Background(), s); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create showcase item"})
		return
	}
	c.JSON(http.StatusCreated, s)
}

func (h *CMSHandler) UpdateShowcaseItem(c *gin.Context) {
	id := c.Param("id")
	var req models.ShowcaseItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	docRef := h.client.Collection("showcase_items").Doc(id)
	
	updates := []firestore.Update{}
	if req.ImageURL != "" { updates = append(updates, firestore.Update{Path: "image_url", Value: req.ImageURL}) }
	if req.Title != "" { updates = append(updates, firestore.Update{Path: "title", Value: req.Title}) }
	if req.Category != "" { updates = append(updates, firestore.Update{Path: "category", Value: req.Category}) }
	updates = append(updates, firestore.Update{Path: "display_order", Value: req.DisplayOrder})
	if req.IsActive != nil { updates = append(updates, firestore.Update{Path: "is_active", Value: *req.IsActive}) }

	if _, err := docRef.Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update showcase item"})
		return
	}
	
	docSnap, _ := docRef.Get(ctx)
	var s models.ShowcaseItem
	docSnap.DataTo(&s)
	s.ID = docSnap.Ref.ID
	c.JSON(http.StatusOK, s)
}

func (h *CMSHandler) DeleteShowcaseItem(c *gin.Context) {
	id := c.Param("id")
	
	// Fetch showcase item first to get imageURL
	ctx := context.Background()
	docSnap, err := h.client.Collection("showcase_items").Doc(id).Get(ctx)
	if err == nil {
		var s models.ShowcaseItem
		if docSnap.DataTo(&s) == nil {
			DeleteFirebaseImage(h.bucket, s.ImageURL)
		}
	}

	if _, err := h.client.Collection("showcase_items").Doc(id).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete showcase item"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Showcase item deleted"})
}

// ── Site Settings ─────────────────────────────────────────────────────────────

func (h *CMSHandler) GetSettings(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("site_settings").Documents(ctx)
	settings := make(map[string]string)
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
			return
		}
		var s models.SiteSetting
		if err := doc.DataTo(&s); err == nil {
			settings[s.Key] = s.Value
		}
	}
	c.JSON(http.StatusOK, settings)
}

func (h *CMSHandler) UpdateSettings(c *gin.Context) {
	var updates models.SettingsUpdateRequest
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	batch := h.client.Batch()
	
	for key, value := range updates {
		docRef := h.client.Collection("site_settings").Doc(key)
		s := models.SiteSetting{
			Key:   key,
			Value: value,
		}
		batch.Set(docRef, s)
	}

	if _, err := batch.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated"})
}

// ── Team Members ──────────────────────────────────────────────────────────────

func (h *CMSHandler) ListTeamMembers(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("team_members").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.TeamMember{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch team members"})
			return
		}
		var s models.TeamMember
		if err := doc.DataTo(&s); err == nil {
			s.ID = doc.Ref.ID
			items = append(items, s)
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) CreateTeamMember(c *gin.Context) {
	var req models.TeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isActive := true
	if req.IsActive != nil { isActive = *req.IsActive }

	docRef := h.client.Collection("team_members").NewDoc()
	s := models.TeamMember{
		ID:           docRef.ID,
		Name:         req.Name,
		Role:         req.Role,
		ImageURL:     req.ImageURL,
		DisplayOrder: req.DisplayOrder,
		IsActive:     isActive,
		CreatedAt:    time.Now(),
	}

	if _, err := docRef.Set(context.Background(), s); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team member"})
		return
	}
	c.JSON(http.StatusCreated, s)
}

func (h *CMSHandler) UpdateTeamMember(c *gin.Context) {
	id := c.Param("id")
	var req models.TeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	docRef := h.client.Collection("team_members").Doc(id)
	
	updates := []firestore.Update{}
	if req.ImageURL != "" { updates = append(updates, firestore.Update{Path: "image_url", Value: req.ImageURL}) }
	if req.Name != "" { updates = append(updates, firestore.Update{Path: "name", Value: req.Name}) }
	if req.Role != "" { updates = append(updates, firestore.Update{Path: "role", Value: req.Role}) }
	updates = append(updates, firestore.Update{Path: "display_order", Value: req.DisplayOrder})
	if req.IsActive != nil { updates = append(updates, firestore.Update{Path: "is_active", Value: *req.IsActive}) }

	if _, err := docRef.Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team member"})
		return
	}
	
	docSnap, _ := docRef.Get(ctx)
	var s models.TeamMember
	docSnap.DataTo(&s)
	s.ID = docSnap.Ref.ID
	c.JSON(http.StatusOK, s)
}

func (h *CMSHandler) DeleteTeamMember(c *gin.Context) {
	id := c.Param("id")
	
	ctx := context.Background()
	docSnap, err := h.client.Collection("team_members").Doc(id).Get(ctx)
	if err == nil {
		var s models.TeamMember
		if docSnap.DataTo(&s) == nil {
			DeleteFirebaseImage(h.bucket, s.ImageURL)
		}
	}

	if _, err := h.client.Collection("team_members").Doc(id).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team member"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Team member deleted"})
}

// ── Services ──────────────────────────────────────────────────────────────────

func (h *CMSHandler) ListServices(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("services").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.Service{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch services"})
			return
		}
		var s models.Service
		if err := doc.DataTo(&s); err == nil {
			s.ID = doc.Ref.ID
			items = append(items, s)
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) CreateService(c *gin.Context) {
	var req models.ServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isActive := true
	if req.IsActive != nil { isActive = *req.IsActive }
	if req.Features == nil { req.Features = []string{} }

	docRef := h.client.Collection("services").NewDoc()
	s := models.Service{
		ID:           docRef.ID,
		Title:        req.Title,
		IconName:     req.IconName,
		ImageURL:     req.ImageURL,
		Description:  req.Description,
		Features:     req.Features,
		DisplayOrder: req.DisplayOrder,
		IsActive:     isActive,
		CreatedAt:    time.Now(),
	}

	if _, err := docRef.Set(context.Background(), s); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create service"})
		return
	}
	c.JSON(http.StatusCreated, s)
}

func (h *CMSHandler) UpdateService(c *gin.Context) {
	id := c.Param("id")
	var req models.ServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Features == nil { req.Features = []string{} }

	ctx := context.Background()
	docRef := h.client.Collection("services").Doc(id)
	
	updates := []firestore.Update{}
	if req.Title != "" { updates = append(updates, firestore.Update{Path: "title", Value: req.Title}) }
	if req.IconName != "" { updates = append(updates, firestore.Update{Path: "icon_name", Value: req.IconName}) }
	if req.ImageURL != "" { updates = append(updates, firestore.Update{Path: "image_url", Value: req.ImageURL}) }
	if req.Description != "" { updates = append(updates, firestore.Update{Path: "description", Value: req.Description}) }
	updates = append(updates, firestore.Update{Path: "features", Value: req.Features})
	updates = append(updates, firestore.Update{Path: "display_order", Value: req.DisplayOrder})
	if req.IsActive != nil { updates = append(updates, firestore.Update{Path: "is_active", Value: *req.IsActive}) }

	if _, err := docRef.Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service"})
		return
	}
	
	docSnap, _ := docRef.Get(ctx)
	var s models.Service
	docSnap.DataTo(&s)
	s.ID = docSnap.Ref.ID
	c.JSON(http.StatusOK, s)
}

func (h *CMSHandler) DeleteService(c *gin.Context) {
	id := c.Param("id")
	
	ctx := context.Background()
	docSnap, err := h.client.Collection("services").Doc(id).Get(ctx)
	if err == nil {
		var s models.Service
		if docSnap.DataTo(&s) == nil {
			DeleteFirebaseImage(h.bucket, s.ImageURL)
		}
	}

	if _, err := h.client.Collection("services").Doc(id).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete service"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Service deleted"})
}

// ── Blog Posts ────────────────────────────────────────────────────────────────

func (h *CMSHandler) ListBlogPosts(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("blog_posts").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.BlogPost{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blog posts"})
			return
		}
		var s models.BlogPost
		if err := doc.DataTo(&s); err == nil {
			s.ID = doc.Ref.ID
			items = append(items, s)
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) CreateBlogPost(c *gin.Context) {
	var req models.BlogPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isActive := true
	if req.IsActive != nil { isActive = *req.IsActive }
	if req.Date == "" { req.Date = time.Now().Format("January 2, 2006") }

	docRef := h.client.Collection("blog_posts").NewDoc()
	s := models.BlogPost{
		ID:            docRef.ID,
		Title:         req.Title,
		Category:      req.Category,
		Excerpt:       req.Excerpt,
		Content:       req.Content,
		Date:          req.Date,
		CoverImageURL: req.CoverImageURL,
		DisplayOrder:  req.DisplayOrder,
		IsActive:      isActive,
		CreatedAt:     time.Now(),
	}

	if _, err := docRef.Set(context.Background(), s); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create blog post"})
		return
	}
	c.JSON(http.StatusCreated, s)
}

func (h *CMSHandler) UpdateBlogPost(c *gin.Context) {
	id := c.Param("id")
	var req models.BlogPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	docRef := h.client.Collection("blog_posts").Doc(id)

	updates := []firestore.Update{}
	if req.Title != "" { updates = append(updates, firestore.Update{Path: "title", Value: req.Title}) }
	if req.Category != "" { updates = append(updates, firestore.Update{Path: "category", Value: req.Category}) }
	if req.Excerpt != "" { updates = append(updates, firestore.Update{Path: "excerpt", Value: req.Excerpt}) }
	if req.Content != "" { updates = append(updates, firestore.Update{Path: "content", Value: req.Content}) }
	if req.Date != "" { updates = append(updates, firestore.Update{Path: "date", Value: req.Date}) }
	updates = append(updates, firestore.Update{Path: "cover_image_url", Value: req.CoverImageURL})
	updates = append(updates, firestore.Update{Path: "display_order", Value: req.DisplayOrder})
	if req.IsActive != nil { updates = append(updates, firestore.Update{Path: "is_active", Value: *req.IsActive}) }

	if _, err := docRef.Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update blog post"})
		return
	}

	docSnap, _ := docRef.Get(ctx)
	var s models.BlogPost
	docSnap.DataTo(&s)
	s.ID = docSnap.Ref.ID
	c.JSON(http.StatusOK, s)
}

func (h *CMSHandler) DeleteBlogPost(c *gin.Context) {
	id := c.Param("id")

	ctx := context.Background()
	docSnap, err := h.client.Collection("blog_posts").Doc(id).Get(ctx)
	if err == nil {
		var s models.BlogPost
		if docSnap.DataTo(&s) == nil {
			DeleteFirebaseImage(h.bucket, s.CoverImageURL)
		}
	}

	if _, err := h.client.Collection("blog_posts").Doc(id).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog post"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Blog post deleted"})
}
