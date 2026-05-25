package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandleContact_ValidSubmission(t *testing.T) {
	body := `{"name":"John Doe","email":"john@example.com","phone":"+94771234567","weddingDate":"2025-06-15","venue":"Grand Hotel","message":"We want to book"}`
	req, err := http.NewRequest("POST", "/api/contact", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(HandleContact)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status 200, got %d", status)
	}
}

func TestHandleContact_ResponseContainsMessage(t *testing.T) {
	body := `{"name":"Jane","email":"jane@example.com","message":"Hello"}`
	req, _ := http.NewRequest("POST", "/api/contact", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleContact).ServeHTTP(rr, req)

	var response map[string]string
	json.NewDecoder(rr.Body).Decode(&response)

	if response["message"] == "" {
		t.Error("Response should contain a message")
	}
}

func TestHandleContact_InvalidJSON(t *testing.T) {
	body := `{invalid json}`
	req, _ := http.NewRequest("POST", "/api/contact", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleContact).ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid JSON, got %d", status)
	}
}

func TestHandleContact_EmptyBody(t *testing.T) {
	req, _ := http.NewRequest("POST", "/api/contact", strings.NewReader(""))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleContact).ServeHTTP(rr, req)

	// Empty body should return 400 since JSON decode will fail
	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("Expected status 400 for empty body, got %d", status)
	}
}

func TestHandleContact_MinimalFields(t *testing.T) {
	body := `{"name":"A","email":"a@b.com","message":"Hi"}`
	req, _ := http.NewRequest("POST", "/api/contact", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleContact).ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status 200 for minimal fields, got %d", status)
	}
}

func TestHandleContact_ContentTypeJSON(t *testing.T) {
	body := `{"name":"Test","email":"t@t.com","message":"Test"}`
	req, _ := http.NewRequest("POST", "/api/contact", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleContact).ServeHTTP(rr, req)

	ct := rr.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Expected content type 'application/json', got '%s'", ct)
	}
}
