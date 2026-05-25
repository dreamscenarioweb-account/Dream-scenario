package models

import (
	"encoding/json"
	"testing"
	"time"
)

// ── Album Tests ──────────────────────────────────────────────────────────────

func TestAlbum_JSONRoundTrip(t *testing.T) {
	now := time.Now().Truncate(time.Second)
	album := Album{
		ID:            "abc-123",
		Title:         "Wedding Day",
		Slug:          "wedding-day",
		Category:      "Weddings",
		CoverImageURL: "https://example.com/cover.jpg",
		DisplayOrder:  1,
		IsPublished:   true,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	data, err := json.Marshal(album)
	if err != nil {
		t.Fatalf("Failed to marshal Album: %v", err)
	}

	var decoded Album
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal Album: %v", err)
	}

	if decoded.ID != album.ID {
		t.Errorf("ID mismatch: expected %q, got %q", album.ID, decoded.ID)
	}
	if decoded.Title != album.Title {
		t.Errorf("Title mismatch: expected %q, got %q", album.Title, decoded.Title)
	}
	if decoded.Slug != album.Slug {
		t.Errorf("Slug mismatch: expected %q, got %q", album.Slug, decoded.Slug)
	}
	if decoded.IsPublished != album.IsPublished {
		t.Errorf("IsPublished mismatch: expected %v, got %v", album.IsPublished, decoded.IsPublished)
	}
	if decoded.CoverImageURL != album.CoverImageURL {
		t.Errorf("CoverImageURL mismatch: expected %q, got %q", album.CoverImageURL, decoded.CoverImageURL)
	}
}

func TestPhoto_JSONFields(t *testing.T) {
	photo := Photo{
		ID:           "photo-1",
		AlbumID:      "album-1",
		URL:          "https://example.com/photo.jpg",
		AltText:      "A beautiful moment",
		DisplayOrder: 2,
		CreatedAt:    time.Now(),
	}

	data, err := json.Marshal(photo)
	if err != nil {
		t.Fatalf("Failed to marshal Photo: %v", err)
	}

	var m map[string]interface{}
	json.Unmarshal(data, &m)

	// The JSON field name should be "url", not "image_url"
	if _, ok := m["url"]; !ok {
		t.Error("Photo JSON should have 'url' field")
	}
	if _, ok := m["image_url"]; ok {
		t.Error("Photo JSON should NOT have 'image_url' field")
	}
	if _, ok := m["album_id"]; !ok {
		t.Error("Photo JSON should have 'album_id' field")
	}
}

func TestAlbumWithPhotos_JSONContainsPhotos(t *testing.T) {
	awp := AlbumWithPhotos{
		Album: Album{
			ID:    "album-1",
			Title: "Test Album",
			Slug:  "test-album",
		},
		Photos: []Photo{
			{ID: "photo-1", URL: "https://example.com/1.jpg"},
			{ID: "photo-2", URL: "https://example.com/2.jpg"},
		},
	}

	data, err := json.Marshal(awp)
	if err != nil {
		t.Fatalf("Failed to marshal AlbumWithPhotos: %v", err)
	}

	var m map[string]interface{}
	json.Unmarshal(data, &m)

	photos, ok := m["photos"].([]interface{})
	if !ok {
		t.Fatal("Expected 'photos' array in JSON")
	}
	if len(photos) != 2 {
		t.Errorf("Expected 2 photos, got %d", len(photos))
	}
}

// ── AdminUser Tests ──────────────────────────────────────────────────────────

func TestAdminUser_PasswordHashExcludedFromJSON(t *testing.T) {
	admin := AdminUser{
		ID:           "admin-1",
		Email:        "admin@example.com",
		PasswordHash: "secret-hash-value",
		Name:         "Admin User",
		CreatedAt:    time.Now(),
	}

	data, err := json.Marshal(admin)
	if err != nil {
		t.Fatalf("Failed to marshal AdminUser: %v", err)
	}

	var m map[string]interface{}
	json.Unmarshal(data, &m)

	if _, ok := m["password_hash"]; ok {
		t.Error("PasswordHash should be excluded from JSON (json:\"-\")")
	}
	if m["email"] != "admin@example.com" {
		t.Errorf("Email mismatch: got %v", m["email"])
	}
}

func TestLoginRequest_JSONBinding(t *testing.T) {
	jsonStr := `{"email":"test@example.com","password":"secret123"}`
	var req LoginRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("Failed to unmarshal LoginRequest: %v", err)
	}
	if req.Email != "test@example.com" {
		t.Errorf("Email mismatch: got %q", req.Email)
	}
	if req.Password != "secret123" {
		t.Errorf("Password mismatch: got %q", req.Password)
	}
}

func TestLoginResponse_ContainsTokenAndAdmin(t *testing.T) {
	admin := &AdminUser{ID: "admin-1", Email: "admin@test.com", Name: "Test"}
	resp := LoginResponse{
		Token: "jwt-token-string",
		Admin: admin,
	}

	data, err := json.Marshal(resp)
	if err != nil {
		t.Fatalf("Failed to marshal LoginResponse: %v", err)
	}

	var m map[string]interface{}
	json.Unmarshal(data, &m)

	if m["token"] != "jwt-token-string" {
		t.Errorf("Token mismatch: got %v", m["token"])
	}
	if m["admin"] == nil {
		t.Error("Expected admin object in response")
	}
}

// ── Contact Models ───────────────────────────────────────────────────────────

func TestContactSubmission_JSONRoundTrip(t *testing.T) {
	weddingDate := "2025-06-15"
	cs := ContactSubmission{
		ID:          "cs-1",
		Name:        "John Doe",
		Email:       "john@example.com",
		Phone:       "+94771234567",
		WeddingDate: &weddingDate,
		Venue:       "Grand Hotel",
		Message:     "We would like to book a session",
		IsRead:      false,
		SubmittedAt: time.Now(),
	}

	data, err := json.Marshal(cs)
	if err != nil {
		t.Fatalf("Failed to marshal ContactSubmission: %v", err)
	}

	var decoded ContactSubmission
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal ContactSubmission: %v", err)
	}

	if decoded.Name != cs.Name {
		t.Errorf("Name mismatch: expected %q, got %q", cs.Name, decoded.Name)
	}
	if *decoded.WeddingDate != weddingDate {
		t.Errorf("WeddingDate mismatch: expected %q, got %q", weddingDate, *decoded.WeddingDate)
	}
}

func TestContactSubmission_NullWeddingDate(t *testing.T) {
	cs := ContactSubmission{
		ID:          "cs-2",
		Name:        "Jane",
		Email:       "jane@example.com",
		WeddingDate: nil,
	}

	data, err := json.Marshal(cs)
	if err != nil {
		t.Fatalf("Failed to marshal: %v", err)
	}

	var m map[string]interface{}
	json.Unmarshal(data, &m)

	if m["wedding_date"] != nil {
		t.Error("Expected null wedding_date when pointer is nil")
	}
}

func TestQuoteRequest_JSONRoundTrip(t *testing.T) {
	eventDate := "2025-12-20"
	qr := QuoteRequest{
		ID:          "qr-1",
		Names:       "Alice & Bob",
		Email:       "alice@example.com",
		Phone:       "+94771230000",
		EventType:   "Wedding",
		EventDate:   &eventDate,
		EventVenue:  "Beach Resort",
		Budget:      "$5000-$10000",
		HearAboutUs: "Instagram",
		Message:     "We need a full-day package",
		IsRead:      false,
		SubmittedAt: time.Now(),
	}

	data, err := json.Marshal(qr)
	if err != nil {
		t.Fatalf("Failed to marshal QuoteRequest: %v", err)
	}

	var decoded QuoteRequest
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal QuoteRequest: %v", err)
	}

	if decoded.Names != qr.Names {
		t.Errorf("Names mismatch: expected %q, got %q", qr.Names, decoded.Names)
	}
	if decoded.EventType != qr.EventType {
		t.Errorf("EventType mismatch: expected %q, got %q", qr.EventType, decoded.EventType)
	}
}

// ── CMS Models ───────────────────────────────────────────────────────────────

func TestHeroSlide_JSONRoundTrip(t *testing.T) {
	s := HeroSlide{
		ID:           "hs-1",
		ImageURL:     "https://example.com/hero.jpg",
		AltText:      "Hero banner",
		DisplayOrder: 0,
		IsActive:     true,
		CreatedAt:    time.Now(),
	}

	data, err := json.Marshal(s)
	if err != nil {
		t.Fatalf("Failed to marshal HeroSlide: %v", err)
	}

	var decoded HeroSlide
	json.Unmarshal(data, &decoded)

	if decoded.ImageURL != s.ImageURL {
		t.Errorf("ImageURL mismatch")
	}
	if decoded.IsActive != true {
		t.Error("IsActive should be true")
	}
}

func TestTestimonial_JSONFields(t *testing.T) {
	test := Testimonial{
		ID:       "t-1",
		ImageURL: "https://example.com/couple.jpg",
		Quote:    "Amazing photography!",
		Couple:   "Sarah & Tom",
		Location: "Colombo",
		Rating:   5,
	}

	data, _ := json.Marshal(test)
	var m map[string]interface{}
	json.Unmarshal(data, &m)

	if m["quote"] != "Amazing photography!" {
		t.Errorf("Quote mismatch: got %v", m["quote"])
	}
	if m["rating"].(float64) != 5 {
		t.Errorf("Rating mismatch: got %v", m["rating"])
	}
}

func TestShowcaseItem_JSONFields(t *testing.T) {
	s := ShowcaseItem{
		ID:       "si-1",
		ImageURL: "https://example.com/showcase.jpg",
		Title:    "Golden Hour",
		Category: "Portraits",
	}

	data, _ := json.Marshal(s)
	var m map[string]interface{}
	json.Unmarshal(data, &m)

	if m["title"] != "Golden Hour" {
		t.Errorf("Title mismatch: got %v", m["title"])
	}
	if m["category"] != "Portraits" {
		t.Errorf("Category mismatch: got %v", m["category"])
	}
}

func TestSiteSetting_JSONRoundTrip(t *testing.T) {
	s := SiteSetting{Key: "site_name", Value: "Captured Moments"}
	data, _ := json.Marshal(s)

	var decoded SiteSetting
	json.Unmarshal(data, &decoded)

	if decoded.Key != "site_name" || decoded.Value != "Captured Moments" {
		t.Errorf("SiteSetting round-trip failed: %+v", decoded)
	}
}

func TestSettingsUpdateRequest_MapParsing(t *testing.T) {
	jsonStr := `{"site_name":"New Name","contact_email":"new@example.com"}`
	var req SettingsUpdateRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("Failed to unmarshal SettingsUpdateRequest: %v", err)
	}

	if req["site_name"] != "New Name" {
		t.Errorf("site_name mismatch: got %q", req["site_name"])
	}
	if req["contact_email"] != "new@example.com" {
		t.Errorf("contact_email mismatch: got %q", req["contact_email"])
	}
	if len(req) != 2 {
		t.Errorf("Expected 2 keys, got %d", len(req))
	}
}

func TestTeamMember_JSONFields(t *testing.T) {
	tm := TeamMember{
		ID:       "tm-1",
		Name:     "John Smith",
		Role:     "Lead Photographer",
		ImageURL: "https://example.com/john.jpg",
	}

	data, _ := json.Marshal(tm)
	var m map[string]interface{}
	json.Unmarshal(data, &m)

	if m["name"] != "John Smith" {
		t.Errorf("Name mismatch: got %v", m["name"])
	}
	if m["role"] != "Lead Photographer" {
		t.Errorf("Role mismatch: got %v", m["role"])
	}
}

func TestService_JSONWithFeatures(t *testing.T) {
	s := Service{
		ID:          "svc-1",
		Title:       "Wedding Photography",
		IconName:    "camera",
		ImageURL:    "https://example.com/svc.jpg",
		Description: "Full day coverage",
		Features:    []string{"8 hours", "500+ photos", "2 photographers"},
	}

	data, _ := json.Marshal(s)
	var decoded Service
	json.Unmarshal(data, &decoded)

	if len(decoded.Features) != 3 {
		t.Errorf("Expected 3 features, got %d", len(decoded.Features))
	}
	if decoded.Features[0] != "8 hours" {
		t.Errorf("Feature[0] mismatch: got %q", decoded.Features[0])
	}
}

func TestService_NilFeatures(t *testing.T) {
	s := Service{
		ID:       "svc-2",
		Title:    "Portrait",
		Features: nil,
	}

	data, _ := json.Marshal(s)
	var m map[string]interface{}
	json.Unmarshal(data, &m)

	if m["features"] != nil {
		t.Error("Expected null features when slice is nil")
	}
}

// ── Request Models ───────────────────────────────────────────────────────────

func TestCreateAlbumRequest_JSONBinding(t *testing.T) {
	jsonStr := `{"title":"Summer Love","slug":"summer-love","category":"Weddings","cover_image_url":"https://example.com/cover.jpg","display_order":1,"is_published":true}`
	var req CreateAlbumRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("Failed to unmarshal: %v", err)
	}

	if req.Title != "Summer Love" {
		t.Errorf("Title mismatch: got %q", req.Title)
	}
	if req.Slug != "summer-love" {
		t.Errorf("Slug mismatch: got %q", req.Slug)
	}
	if !req.IsPublished {
		t.Error("IsPublished should be true")
	}
}

func TestUpdateAlbumRequest_IsPublishedPointer(t *testing.T) {
	// Test with is_published = false (should be distinguishable from missing)
	jsonStr := `{"title":"Updated","is_published":false}`
	var req UpdateAlbumRequest
	json.Unmarshal([]byte(jsonStr), &req)

	if req.IsPublished == nil {
		t.Fatal("IsPublished should not be nil when explicitly set to false")
	}
	if *req.IsPublished != false {
		t.Error("IsPublished should be false")
	}

	// Test with is_published missing
	jsonStr2 := `{"title":"Updated"}`
	var req2 UpdateAlbumRequest
	json.Unmarshal([]byte(jsonStr2), &req2)

	if req2.IsPublished != nil {
		t.Error("IsPublished should be nil when missing from JSON")
	}
}

func TestAlbumCategory_JSONRoundTrip(t *testing.T) {
	cat := AlbumCategory{
		ID:           "cat-1",
		Name:         "Weddings",
		DisplayOrder: 0,
		CreatedAt:    time.Now(),
	}

	data, _ := json.Marshal(cat)
	var decoded AlbumCategory
	json.Unmarshal(data, &decoded)

	if decoded.Name != "Weddings" {
		t.Errorf("Name mismatch: got %q", decoded.Name)
	}
}

func TestAlbumCategoryRequest_JSONBinding(t *testing.T) {
	jsonStr := `{"name":"Portraits","display_order":2}`
	var req AlbumCategoryRequest
	json.Unmarshal([]byte(jsonStr), &req)

	if req.Name != "Portraits" {
		t.Errorf("Name mismatch: got %q", req.Name)
	}
	if req.DisplayOrder != 2 {
		t.Errorf("DisplayOrder mismatch: got %d", req.DisplayOrder)
	}
}

func TestAddPhotoRequest_JSONBinding(t *testing.T) {
	jsonStr := `{"url":"https://example.com/photo.jpg","alt_text":"Beach photo","display_order":3}`
	var req AddPhotoRequest
	json.Unmarshal([]byte(jsonStr), &req)

	if req.URL != "https://example.com/photo.jpg" {
		t.Errorf("URL mismatch: got %q", req.URL)
	}
	if req.AltText != "Beach photo" {
		t.Errorf("AltText mismatch: got %q", req.AltText)
	}
}

func TestReorderPhotosRequest_JSONBinding(t *testing.T) {
	jsonStr := `{"photos":[{"id":"p1","display_order":0},{"id":"p2","display_order":1}]}`
	var req ReorderPhotosRequest
	json.Unmarshal([]byte(jsonStr), &req)

	if len(req.Photos) != 2 {
		t.Fatalf("Expected 2 photos, got %d", len(req.Photos))
	}
	if req.Photos[0].ID != "p1" {
		t.Errorf("Photo[0].ID mismatch: got %q", req.Photos[0].ID)
	}
	if req.Photos[1].DisplayOrder != 1 {
		t.Errorf("Photo[1].DisplayOrder mismatch: got %d", req.Photos[1].DisplayOrder)
	}
}

func TestHeroSlideRequest_IsActivePointer(t *testing.T) {
	jsonStr := `{"image_url":"https://example.com/hero.jpg","is_active":false}`
	var req HeroSlideRequest
	json.Unmarshal([]byte(jsonStr), &req)

	if req.IsActive == nil {
		t.Fatal("IsActive should not be nil")
	}
	if *req.IsActive != false {
		t.Error("IsActive should be false")
	}
}

func TestQuoteRequestBody_JSONBinding(t *testing.T) {
	jsonStr := `{"names":"Alice & Bob","email":"alice@test.com","event_type":"Wedding","message":"We need photos"}`
	var req QuoteRequestBody
	json.Unmarshal([]byte(jsonStr), &req)

	if req.Names != "Alice & Bob" {
		t.Errorf("Names mismatch: got %q", req.Names)
	}
	if req.EventType != "Wedding" {
		t.Errorf("EventType mismatch: got %q", req.EventType)
	}
}

func TestServiceRequest_FeaturesArray(t *testing.T) {
	jsonStr := `{"title":"Photo Booth","icon_name":"booth","image_url":"https://example.com/booth.jpg","features":["instant prints","props"]}`
	var req ServiceRequest
	json.Unmarshal([]byte(jsonStr), &req)

	if len(req.Features) != 2 {
		t.Errorf("Expected 2 features, got %d", len(req.Features))
	}
}
