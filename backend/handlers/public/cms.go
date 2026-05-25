package public

import (
	"context"
	"log"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"captured-moments-backend/models"
)

type CMSHandler struct {
	client *firestore.Client
}

func NewCMSHandler(client *firestore.Client) *CMSHandler {
	return &CMSHandler{client: client}
}

func (h *CMSHandler) GetHeroSlides(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("hero_slides").OrderBy("display_order", firestore.Asc).Documents(ctx)
	slides := []models.HeroSlide{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			log.Printf("Error fetching hero slides: %v", err)
			break
		}
		var s models.HeroSlide
		if err := doc.DataTo(&s); err == nil {
			if s.IsActive {
				s.ID = doc.Ref.ID
				slides = append(slides, s)
			}
		}
	}
	c.JSON(http.StatusOK, slides)
}

func (h *CMSHandler) GetTestimonials(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("testimonials").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.Testimonial{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			log.Printf("Error fetching testimonials: %v", err)
			break
		}
		var t models.Testimonial
		if err := doc.DataTo(&t); err == nil {
			if t.IsActive {
				t.ID = doc.Ref.ID
				items = append(items, t)
			}
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) GetShowcaseItems(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("showcase_items").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.ShowcaseItem{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			log.Printf("Error fetching showcase items: %v", err)
			break
		}
		var s models.ShowcaseItem
		if err := doc.DataTo(&s); err == nil {
			if s.IsActive {
				s.ID = doc.Ref.ID
				items = append(items, s)
			}
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) GetServices(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("services").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.Service{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			log.Printf("Error fetching services: %v", err)
			break
		}
		var s models.Service
		if err := doc.DataTo(&s); err == nil {
			if s.IsActive {
				s.ID = doc.Ref.ID
				items = append(items, s)
			}
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) GetSettings(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("site_settings").Documents(ctx)
	settings := make(map[string]string)
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			log.Printf("Error fetching settings: %v", err)
			break
		}
		var s models.SiteSetting
		if err := doc.DataTo(&s); err == nil {
			settings[s.Key] = s.Value
		}
	}
	c.JSON(http.StatusOK, settings)
}

func (h *CMSHandler) GetTeamMembers(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("team_members").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.TeamMember{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			log.Printf("Error fetching team members: %v", err)
			break
		}
		var s models.TeamMember
		if err := doc.DataTo(&s); err == nil {
			if s.IsActive {
				s.ID = doc.Ref.ID
				items = append(items, s)
			}
		}
	}
	c.JSON(http.StatusOK, items)
}

func (h *CMSHandler) GetBlogPosts(c *gin.Context) {
	ctx := context.Background()
	iter := h.client.Collection("blog_posts").OrderBy("display_order", firestore.Asc).Documents(ctx)
	items := []models.BlogPost{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done { break }
		if err != nil {
			log.Printf("Error fetching blog posts: %v", err)
			break
		}
		var s models.BlogPost
		if err := doc.DataTo(&s); err == nil {
			if s.IsActive {
				s.ID = doc.Ref.ID
				items = append(items, s)
			}
		}
	}
	c.JSON(http.StatusOK, items)
}
