package main

// Seed script — run once per new photographer account to populate all CMS sections
// with professional placeholder content. Photographers replace images and copy via
// the Admin Dashboard after setup.
//
// Usage:
//   cd backend
//   go run scripts/seed_data.go

import (
	"context"
	"fmt"
	"log"
	"time"

	"captured-moments-backend/db"

	"cloud.google.com/go/firestore"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	firebaseDB := db.InitFirebase()
	ctx := context.Background()
	client := firebaseDB.Client

	log.Println("Starting seed data population...")

	seedSettings(ctx, client)
	seedHeroSlides(ctx, client)
	seedServices(ctx, client)
	seedTestimonials(ctx, client)
	seedBlogPosts(ctx, client)
	seedTeamMembers(ctx, client)
	seedAlbumCategories(ctx, client)

	fmt.Println("\n--- SEED COMPLETE ---")
	fmt.Println("Log in to the Admin Dashboard to replace placeholder images and personalise the text.")
	fmt.Println("-------------------")
}

// ── Site Settings ─────────────────────────────────────────────────────────────

func seedSettings(ctx context.Context, client *firestore.Client) {
	settings := map[string]string{
		"site_name":           "Your Photography Studio",
		"about_title":         "More Than a Photographer — A Storyteller",
		"about_tagline":       "Capturing the moments that take your breath away",
		"about_description":   "Every couple has a unique love story, and it deserves to be told beautifully. I believe that the most powerful images aren't posed or perfect — they're honest, emotional, and alive with the energy of the moment. Whether it's a glance across the aisle or a burst of laughter during the first dance, I'm there to preserve it forever.",
		"about_description_2": "Based in [Your City], I travel worldwide to document weddings, engagements, and intimate celebrations. My approach is relaxed and unobtrusive — you'll forget I'm there, and the images will surprise you with how much they capture.",
		"about_image_url":     "",
		"instagram_url":      "https://www.instagram.com/dream.scenario__weddings?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
		"stat_weddings":       "200+",
		"stat_happy_couples":  "200+",
		"stat_years":          "8",
		"stat_countries":      "15",
	}

	batch := client.Batch()
	for key, value := range settings {
		docRef := client.Collection("site_settings").Doc(key)
		batch.Set(docRef, map[string]interface{}{"key": key, "value": value})
	}
	if _, err := batch.Commit(ctx); err != nil {
		log.Printf("  ERROR seeding settings: %v\n", err)
		return
	}
	fmt.Println("  ✓ Site settings seeded")
}

// ── Hero Slides ───────────────────────────────────────────────────────────────

func seedHeroSlides(ctx context.Context, client *firestore.Client) {
	slides := []map[string]interface{}{
		{
			"image_url":     "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&auto=format&fit=crop&q=80",
			"alt_text":      "A couple sharing their first kiss at the altar during a golden sunset ceremony",
			"display_order": 1,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"image_url":     "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&auto=format&fit=crop&q=80",
			"alt_text":      "Bride and groom walking hand in hand through a sun-drenched garden [focal: center 60%]",
			"display_order": 2,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"image_url":     "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&auto=format&fit=crop&q=80",
			"alt_text":      "An intimate moment between bride and groom on the dance floor surrounded by candlelight",
			"display_order": 3,
			"is_active":     true,
			"created_at":    time.Now(),
		},
	}

	for _, slide := range slides {
		docRef := client.Collection("hero_slides").NewDoc()
		slide["id"] = docRef.ID
		if _, err := docRef.Set(ctx, slide); err != nil {
			log.Printf("  ERROR seeding hero slide: %v\n", err)
			continue
		}
	}
	fmt.Println("  ✓ Hero slides seeded (3)")
}

// ── Services ──────────────────────────────────────────────────────────────────

func seedServices(ctx context.Context, client *firestore.Client) {
	services := []map[string]interface{}{
		{
			"title":       "Full Wedding Coverage",
			"icon_name":   "Camera",
			"image_url":   "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
			"description": "From the quiet morning preparations to the last song of the night, I document the complete arc of your wedding day. Every tear, every laugh, every look — captured naturally as your story unfolds.",
			"features": []string{
				"8–12 hours of full-day coverage",
				"Two professional photographers",
				"Private online gallery within 6 weeks",
				"500+ high-resolution edited images",
				"Print release for all images",
				"Complimentary engagement session",
			},
			"display_order": 1,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"title":       "Engagement Sessions",
			"icon_name":   "Heart",
			"image_url":   "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&auto=format&fit=crop&q=80",
			"description": "Your engagement session is far more than just beautiful photos — it's a chance for us to get comfortable together before the big day. We'll find a location that reflects your story and let the rest happen naturally.",
			"features": []string{
				"1–2 hour session at a location of your choice",
				"80–120 high-resolution edited images",
				"Private online gallery within 2 weeks",
				"Perfect for save-the-dates and announcements",
				"Style consultation included",
			},
			"display_order": 2,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"title":       "Destination Weddings",
			"icon_name":   "Globe",
			"image_url":   "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80",
			"description": "From Tuscan vineyards to Balinese clifftops, I travel wherever your love story takes you. Destination weddings deserve a photographer who is as excited about the adventure as you are.",
			"features": []string{
				"Full-day coverage at your chosen destination",
				"Pre-wedding location scouting",
				"600+ high-resolution edited images",
				"Private online gallery with download rights",
				"Custom travel packages available",
				"Multi-day elopement packages on request",
			},
			"display_order": 3,
			"is_active":     true,
			"created_at":    time.Now(),
		},
	}

	for _, svc := range services {
		docRef := client.Collection("services").NewDoc()
		svc["id"] = docRef.ID
		if _, err := docRef.Set(ctx, svc); err != nil {
			log.Printf("  ERROR seeding service: %v\n", err)
			continue
		}
	}
	fmt.Println("  ✓ Services seeded (3)")
}

// ── Testimonials ──────────────────────────────────────────────────────────────

func seedTestimonials(ctx context.Context, client *firestore.Client) {
	testimonials := []map[string]interface{}{
		{
			"image_url":     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
			"quote":         "We are absolutely speechless. Looking through our gallery for the first time felt like reliving the most magical day of our lives — every single emotion perfectly captured. We cannot recommend highly enough.",
			"couple":        "Sarah & James Miller",
			"location":      "Devon, England",
			"rating":        5,
			"display_order": 1,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"image_url":     "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80",
			"quote":         "From the first email to the final gallery delivery, the experience was seamless and joyful. Our photos are breathtaking — our families keep asking us to order prints for their walls. Thank you for making us look and feel so beautiful.",
			"couple":        "Emily & David Chen",
			"location":      "Sydney, Australia",
			"rating":        5,
			"display_order": 2,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"image_url":     "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=200&auto=format&fit=crop&q=80",
			"quote":         "Booking our photographer was the single best decision we made for our wedding. They were invisible on the day — we genuinely forgot they were there — and the images are absolutely extraordinary. Pure magic.",
			"couple":        "Olivia & Thomas Wright",
			"location":      "Tuscany, Italy",
			"rating":        5,
			"display_order": 3,
			"is_active":     true,
			"created_at":    time.Now(),
		},
	}

	for _, t := range testimonials {
		docRef := client.Collection("testimonials").NewDoc()
		t["id"] = docRef.ID
		if _, err := docRef.Set(ctx, t); err != nil {
			log.Printf("  ERROR seeding testimonial: %v\n", err)
			continue
		}
	}
	fmt.Println("  ✓ Testimonials seeded (3)")
}

// ── Blog Posts / Tips ─────────────────────────────────────────────────────────

func seedBlogPosts(ctx context.Context, client *firestore.Client) {
	posts := []map[string]interface{}{
		{
			"title":           "Golden Hour Magic: How to Capture Breathtaking Wedding Portraits",
			"category":        "Lighting",
			"date":            "June 2025",
			"cover_image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
			"excerpt":         "The hour just before sunset is a photographer's greatest gift. We'll show you how to build your wedding timeline around this magical window to create portraits glowing with warmth, depth, and romance that no studio light can replicate.",
			"content":         "Golden hour — the 60 minutes following sunrise or preceding sunset — produces the most flattering, emotionally resonant light in nature. The sun sits low on the horizon, scattering its rays through miles of atmosphere and stripping away the harsh blue tones that make midday portraits look flat.\n\nFor wedding photography, this means warm amber tones that flatter every skin tone, long soft shadows that add dimension, and a natural bokeh that turns an ordinary garden into something cinematic.\n\nHow to plan around it:\n\n1. Know your exact golden hour time. Use a sun calculator app (e.g. The Photographer's Ephemeris) to find the precise sunset time for your venue and date. In the UK in summer this can be as late as 9pm.\n\n2. Build a 20-minute buffer into your timeline. Block out 6:30–7:30pm (adjust to your local sunset) as 'portrait time' and protect it fiercely from over-running speeches.\n\n3. Choose an open west-facing location. A field, rooftop, lake edge, or even a clear corridor between buildings will work. The key is an unobstructed view toward the setting sun.\n\n4. Trust your photographer. During golden hour, the best images come from spontaneous movement and real laughter, not stiff poses. Hold hands and walk, whisper something in each other's ear, or simply look at each other. The camera will handle the rest.",
			"display_order":   1,
			"is_active":       true,
			"created_at":      time.Now(),
		},
		{
			"title":           "Engagement Shoot Styling: Your Complete Guide to Looking Naturally You",
			"category":        "Planning",
			"date":            "May 2025",
			"cover_image_url": "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&auto=format&fit=crop&q=80",
			"excerpt":         "Your engagement session is the perfect rehearsal for your wedding day. From choosing outfits that complement without matching to finding locations that tell your love story — here's everything you need to walk in front of the camera feeling completely at ease.",
			"content":         "An engagement session does two things simultaneously: it gives you stunning photographs for your save-the-dates, and it gives you and your photographer the chance to build a working relationship before the most important day of your life.\n\nThe secret to great engagement photos isn't finding the most Instagram-worthy location — it's feeling genuinely comfortable and having fun. Here's how to make that happen.\n\nOutfit strategy:\n- Choose two outfits: one casual (jeans, linen shirt, sundress) and one elevated (smart-casual or semi-formal). Changing mid-session adds variety to the gallery.\n- Coordinate without matching. If one person is wearing navy, the other might wear a warm cream or dusty rose. Avoid identical outfits — they read as costume rather than couple.\n- Prioritise comfort. If you can't walk or sit naturally in it, leave it at home.\n- Solid colours and subtle patterns photograph beautifully. Avoid loud logos or very fine stripes (they can create a moiré effect in photos).\n\nLocation ideas:\n- Where you had your first date\n- Your favourite neighbourhood to walk in together\n- A landscape that reflects something you love doing as a couple (coast, woodland, vineyard)\n- Your home — candid in-home sessions often produce the most emotionally resonant images\n\nOn the day itself: arrive a few minutes early, bring a small bag with a hairbrush, lip balm, and any props that feel personal. Most importantly — talk to each other, not the camera.",
			"display_order":   2,
			"is_active":       true,
			"created_at":      time.Now(),
		},
		{
			"title":           "Building the Perfect Wedding Day Timeline for a Stunning Gallery",
			"category":        "Organisation",
			"date":            "April 2025",
			"cover_image_url": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
			"excerpt":         "A thoughtfully crafted timeline is the invisible backbone of every breathtaking wedding gallery. Discover how to build in buffer time, schedule your portraits during golden hour, and ensure not a single meaningful moment slips through the cracks.",
			"content":         "Every photographer has a version of the same story: the couple who didn't build enough time into their timeline and spent their wedding day rushing from moment to moment, too stressed to be present. The good news? It's entirely preventable.\n\nA great wedding day timeline is generous with time, realistic about travel, and intentionally builds space for the unplanned moments that often become the most treasured images.\n\nSample timeline for a 3pm ceremony:\n\n9:00am — Photographer arrives for bridal preparations (hair & makeup in progress)\n11:30am — Detail shots (dress, rings, stationery, bouquet)\n12:00pm — Bride getting into dress\n12:30pm — Bridal portraits\n1:00pm — Groom preparations and portraits\n2:00pm — Guests arrive at ceremony venue\n2:45pm — Bridal party and groomsmen portraits (venue)\n3:00pm — Ceremony begins\n3:45pm — Ceremony ends, guests move to drinks reception\n4:00pm — Couple portraits (30 minutes while guests enjoy drinks)\n5:30pm — Wedding breakfast begins\n7:00pm — Speeches\n7:45pm — Couple portraits (golden hour — protect this time!)\n8:15pm — First dance\n8:30pm — Evening reception open\n\nKey principles:\n1. Add 15-minute buffers before any major transition\n2. Protect your golden hour portraits — this is non-negotiable\n3. Communicate the timeline to your bridal party, family, and venue coordinator\n4. Share a copy with your photographer at least 2 weeks before the day",
			"display_order":   3,
			"is_active":       true,
			"created_at":      time.Now(),
		},
	}

	for _, post := range posts {
		docRef := client.Collection("blog_posts").NewDoc()
		post["id"] = docRef.ID
		if _, err := docRef.Set(ctx, post); err != nil {
			log.Printf("  ERROR seeding blog post: %v\n", err)
			continue
		}
	}
	fmt.Println("  ✓ Blog posts / tips seeded (3)")
}

// ── Team Members ──────────────────────────────────────────────────────────────

func seedTeamMembers(ctx context.Context, client *firestore.Client) {
	members := []map[string]interface{}{
		{
			"name":          "Your Name",
			"role":          "Lead Photographer & Founder",
			"image_url":     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
			"display_order": 1,
			"is_active":     true,
			"created_at":    time.Now(),
		},
		{
			"name":          "Second Photographer",
			"role":          "Associate Photographer",
			"image_url":     "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop&q=80",
			"display_order": 2,
			"is_active":     true,
			"created_at":    time.Now(),
		},
	}

	for _, member := range members {
		docRef := client.Collection("team_members").NewDoc()
		member["id"] = docRef.ID
		if _, err := docRef.Set(ctx, member); err != nil {
			log.Printf("  ERROR seeding team member: %v\n", err)
			continue
		}
	}
	fmt.Println("  ✓ Team members seeded (2)")
}

// ── Album Categories ──────────────────────────────────────────────────────────

func seedAlbumCategories(ctx context.Context, client *firestore.Client) {
	categories := []map[string]interface{}{
		{"name": "Wedding", "display_order": 1, "created_at": time.Now()},
		{"name": "Engagement", "display_order": 2, "created_at": time.Now()},
		{"name": "Portraits", "display_order": 3, "created_at": time.Now()},
		{"name": "Destination", "display_order": 4, "created_at": time.Now()},
		{"name": "Elopement", "display_order": 5, "created_at": time.Now()},
	}

	for _, cat := range categories {
		docRef := client.Collection("album_categories").NewDoc()
		cat["id"] = docRef.ID
		if _, err := docRef.Set(ctx, cat); err != nil {
			log.Printf("  ERROR seeding album category: %v\n", err)
			continue
		}
	}
	fmt.Println("  ✓ Album categories seeded (5)")
}
