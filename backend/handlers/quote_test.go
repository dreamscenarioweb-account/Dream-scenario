package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandleQuote_ValidSubmission(t *testing.T) {
	body := `{"eventType":"Wedding","names":"Alice & Bob","email":"alice@example.com","phone":"+94771234567","eventDate":"2025-12-20","eventVenue":"Beach Resort","hearAboutUs":"Instagram","budget":"$5000-$10000","message":"We need a full day package"}`
	req, err := http.NewRequest("POST", "/api/quote-request", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(HandleQuote)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status 200, got %d", status)
	}
}

func TestHandleQuote_ResponseContainsMessage(t *testing.T) {
	body := `{"eventType":"Portrait","names":"John","email":"john@test.com","message":"Need photos"}`
	req, _ := http.NewRequest("POST", "/api/quote-request", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleQuote).ServeHTTP(rr, req)

	var response map[string]string
	json.NewDecoder(rr.Body).Decode(&response)

	if response["message"] == "" {
		t.Error("Response should contain a message")
	}
}

func TestHandleQuote_InvalidJSON(t *testing.T) {
	body := `{broken json:}`
	req, _ := http.NewRequest("POST", "/api/quote-request", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleQuote).ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid JSON, got %d", status)
	}
}

func TestHandleQuote_EmptyBody(t *testing.T) {
	req, _ := http.NewRequest("POST", "/api/quote-request", strings.NewReader(""))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleQuote).ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("Expected status 400 for empty body, got %d", status)
	}
}

func TestHandleQuote_MinimalFields(t *testing.T) {
	body := `{"names":"X","email":"x@y.com","eventType":"Other","message":"Hi"}`
	req, _ := http.NewRequest("POST", "/api/quote-request", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleQuote).ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status 200 for minimal fields, got %d", status)
	}
}

func TestHandleQuote_ContentTypeJSON(t *testing.T) {
	body := `{"names":"T","email":"t@t.com","eventType":"W","message":"Test"}`
	req, _ := http.NewRequest("POST", "/api/quote-request", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(HandleQuote).ServeHTTP(rr, req)

	ct := rr.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Expected content type 'application/json', got '%s'", ct)
	}
}
