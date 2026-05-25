package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleGetPosts_Status200(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/blog/posts", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(HandleGetPosts)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status 200, got %d", status)
	}
}

func TestHandleGetPosts_ContentType(t *testing.T) {
	req, _ := http.NewRequest("GET", "/api/blog/posts", nil)
	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleGetPosts).ServeHTTP(rr, req)

	ct := rr.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Expected content type 'application/json', got '%s'", ct)
	}
}

func TestHandleGetPosts_ResponseStructure(t *testing.T) {
	req, _ := http.NewRequest("GET", "/api/blog/posts", nil)
	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleGetPosts).ServeHTTP(rr, req)

	var response BlogResponse
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if response.FeaturedPost.Title == "" {
		t.Error("Featured post title should not be empty")
	}
	if response.FeaturedPost.Category != "Featured Story" {
		t.Errorf("Featured post category: expected 'Featured Story', got '%s'", response.FeaturedPost.Category)
	}
}

func TestHandleGetPosts_PostCount(t *testing.T) {
	req, _ := http.NewRequest("GET", "/api/blog/posts", nil)
	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleGetPosts).ServeHTTP(rr, req)

	var response BlogResponse
	json.NewDecoder(rr.Body).Decode(&response)

	if len(response.Posts) != 6 {
		t.Errorf("Expected 6 posts, got %d", len(response.Posts))
	}
}

func TestHandleGetPosts_PostsHaveRequiredFields(t *testing.T) {
	req, _ := http.NewRequest("GET", "/api/blog/posts", nil)
	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleGetPosts).ServeHTTP(rr, req)

	var response BlogResponse
	json.NewDecoder(rr.Body).Decode(&response)

	for i, post := range response.Posts {
		if post.Title == "" {
			t.Errorf("Post[%d] has empty title", i)
		}
		if post.Category == "" {
			t.Errorf("Post[%d] has empty category", i)
		}
		if post.Image == "" {
			t.Errorf("Post[%d] has empty image", i)
		}
		if post.Date == "" {
			t.Errorf("Post[%d] has empty date", i)
		}
		if post.Excerpt == "" {
			t.Errorf("Post[%d] has empty excerpt", i)
		}
	}
}

func TestHandleGetPosts_FeaturedPostHasAuthor(t *testing.T) {
	req, _ := http.NewRequest("GET", "/api/blog/posts", nil)
	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleGetPosts).ServeHTTP(rr, req)

	var response BlogResponse
	json.NewDecoder(rr.Body).Decode(&response)

	if response.FeaturedPost.Author == "" {
		t.Error("Featured post should have an author")
	}
}

func TestHandleGetPosts_UniquePostIDs(t *testing.T) {
	req, _ := http.NewRequest("GET", "/api/blog/posts", nil)
	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleGetPosts).ServeHTTP(rr, req)

	var response BlogResponse
	json.NewDecoder(rr.Body).Decode(&response)

	seen := make(map[int]bool)
	for _, post := range response.Posts {
		if seen[post.ID] {
			t.Errorf("Duplicate post ID: %d", post.ID)
		}
		seen[post.ID] = true
	}
}
