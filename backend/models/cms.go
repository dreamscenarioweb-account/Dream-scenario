package models

import "time"

// ── Hero Slides ───────────────────────────────────────────────────────────────

type HeroSlide struct {
	ID           string    `json:"id" firestore:"id"`
	ImageURL     string    `json:"image_url" firestore:"image_url"`
	AltText      string    `json:"alt_text" firestore:"alt_text"`
	DisplayOrder int       `json:"display_order" firestore:"display_order"`
	IsActive     bool      `json:"is_active" firestore:"is_active"`
	CreatedAt    time.Time `json:"created_at" firestore:"created_at"`
}

type HeroSlideRequest struct {
	ImageURL     string `json:"image_url" binding:"required"`
	AltText      string `json:"alt_text"`
	DisplayOrder int    `json:"display_order"`
	IsActive     *bool  `json:"is_active"`
}

// ── Testimonials ──────────────────────────────────────────────────────────────

type Testimonial struct {
	ID           string    `json:"id" firestore:"id"`
	ImageURL     string    `json:"image_url" firestore:"image_url"`
	Quote        string    `json:"quote" firestore:"quote"`
	Couple       string    `json:"couple" firestore:"couple"`
	Location     string    `json:"location" firestore:"location"`
	Rating       int       `json:"rating" firestore:"rating"`
	DisplayOrder int       `json:"display_order" firestore:"display_order"`
	IsActive     bool      `json:"is_active" firestore:"is_active"`
	CreatedAt    time.Time `json:"created_at" firestore:"created_at"`
}

type TestimonialRequest struct {
	ImageURL     string `json:"image_url" binding:"required"`
	Quote        string `json:"quote" binding:"required"`
	Couple       string `json:"couple" binding:"required"`
	Location     string `json:"location" binding:"required"`
	Rating       int    `json:"rating"`
	DisplayOrder int    `json:"display_order"`
	IsActive     *bool  `json:"is_active"`
}

// ── Showcase Items ────────────────────────────────────────────────────────────

type ShowcaseItem struct {
	ID           string    `json:"id" firestore:"id"`
	ImageURL     string    `json:"image_url" firestore:"image_url"`
	Title        string    `json:"title" firestore:"title"`
	Category     string    `json:"category" firestore:"category"`
	DisplayOrder int       `json:"display_order" firestore:"display_order"`
	IsActive     bool      `json:"is_active" firestore:"is_active"`
	CreatedAt    time.Time `json:"created_at" firestore:"created_at"`
}

type ShowcaseItemRequest struct {
	ImageURL     string `json:"image_url" binding:"required"`
	Title        string `json:"title" binding:"required"`
	Category     string `json:"category" binding:"required"`
	DisplayOrder int    `json:"display_order"`
	IsActive     *bool  `json:"is_active"`
}

// ── Site Settings ─────────────────────────────────────────────────────────────

type SiteSetting struct {
	Key   string `json:"key" firestore:"key"`
	Value string `json:"value" firestore:"value"`
}

// Map of key → value for PATCH /admin/settings
type SettingsUpdateRequest map[string]string

// ── Team Members ──────────────────────────────────────────────────────────────

type TeamMember struct {
	ID           string    `json:"id" firestore:"id"`
	Name         string    `json:"name" firestore:"name"`
	Role         string    `json:"role" firestore:"role"`
	ImageURL     string    `json:"image_url" firestore:"image_url"`
	DisplayOrder int       `json:"display_order" firestore:"display_order"`
	IsActive     bool      `json:"is_active" firestore:"is_active"`
	CreatedAt    time.Time `json:"created_at" firestore:"created_at"`
}

type TeamMemberRequest struct {
	Name         string `json:"name" binding:"required"`
	Role         string `json:"role" binding:"required"`
	ImageURL     string `json:"image_url" binding:"required"`
	DisplayOrder int    `json:"display_order"`
	IsActive     *bool  `json:"is_active"`
}

// ── Services ──────────────────────────────────────────────────────────────────

type Service struct {
	ID           string    `json:"id" firestore:"id"`
	Title        string    `json:"title" firestore:"title"`
	IconName     string    `json:"icon_name" firestore:"icon_name"`
	ImageURL     string    `json:"image_url" firestore:"image_url"`
	Description  string    `json:"description" firestore:"description"`
	Features     []string  `json:"features" firestore:"features"`
	DisplayOrder int       `json:"display_order" firestore:"display_order"`
	IsActive     bool      `json:"is_active" firestore:"is_active"`
	CreatedAt    time.Time `json:"created_at" firestore:"created_at"`
}

type ServiceRequest struct {
	Title        string   `json:"title"         binding:"required"`
	IconName     string   `json:"icon_name"     binding:"required"`
	ImageURL     string   `json:"image_url"     binding:"required"`
	Description  string   `json:"description"`
	Features     []string `json:"features"`
	DisplayOrder int      `json:"display_order"`
	IsActive     *bool    `json:"is_active"`
}

// ── Blog Posts ────────────────────────────────────────────────────────────────

type BlogPost struct {
	ID            string    `json:"id" firestore:"id"`
	Title         string    `json:"title" firestore:"title"`
	Category      string    `json:"category" firestore:"category"`
	Excerpt       string    `json:"excerpt" firestore:"excerpt"`
	Content       string    `json:"content" firestore:"content"`
	Date          string    `json:"date" firestore:"date"`
	CoverImageURL string    `json:"cover_image_url" firestore:"cover_image_url"`
	DisplayOrder  int       `json:"display_order" firestore:"display_order"`
	IsActive      bool      `json:"is_active" firestore:"is_active"`
	CreatedAt     time.Time `json:"created_at" firestore:"created_at"`
}

type BlogPostRequest struct {
	Title         string `json:"title" binding:"required"`
	Category      string `json:"category" binding:"required"`
	Excerpt       string `json:"excerpt" binding:"required"`
	Content       string `json:"content"`
	Date          string `json:"date"`
	CoverImageURL string `json:"cover_image_url"`
	DisplayOrder  int    `json:"display_order"`
	IsActive      *bool  `json:"is_active"`
}
