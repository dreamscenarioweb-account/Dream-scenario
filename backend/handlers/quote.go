package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

type QuoteRequest struct {
	EventType   string `json:"eventType"`
	Names       string `json:"names"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	EventDate   string `json:"eventDate"`
	EventVenue  string `json:"eventVenue"`
	HearAboutUs string `json:"hearAboutUs"`
	Budget      string `json:"budget"`
	Message     string `json:"message"`
}

func HandleQuote(w http.ResponseWriter, r *http.Request) {
	var req QuoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Received Quote Request: %+v\n", req)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Quote request submitted successfully"})
}
