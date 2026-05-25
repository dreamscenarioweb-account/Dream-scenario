package models

import "time"

type ContactSubmission struct {
	ID          string     `json:"id" firestore:"id"`
	Name        string     `json:"name" firestore:"name"`
	Email       string     `json:"email" firestore:"email"`
	Phone       string     `json:"phone" firestore:"phone"`
	WeddingDate *string    `json:"wedding_date" firestore:"wedding_date"`
	Venue       string     `json:"venue" firestore:"venue"`
	Message     string     `json:"message" firestore:"message"`
	IsRead      bool       `json:"is_read" firestore:"is_read"`
	SubmittedAt time.Time  `json:"submitted_at" firestore:"submitted_at"`
}

type ContactRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Phone       string `json:"phone"`
	WeddingDate string `json:"wedding_date"`
	Venue       string `json:"venue"`
	Message     string `json:"message" binding:"required"`
}

type QuoteRequest struct {
	ID           string    `json:"id" firestore:"id"`
	Names        string    `json:"names" firestore:"names"`
	Email        string    `json:"email" firestore:"email"`
	Phone        string    `json:"phone" firestore:"phone"`
	EventType    string    `json:"event_type" firestore:"event_type"`
	EventDate    *string   `json:"event_date" firestore:"event_date"`
	EventVenue   string    `json:"event_venue" firestore:"event_venue"`
	Budget       string    `json:"budget" firestore:"budget"`
	HearAboutUs  string    `json:"hear_about_us" firestore:"hear_about_us"`
	Message      string    `json:"message" firestore:"message"`
	IsRead       bool      `json:"is_read" firestore:"is_read"`
	SubmittedAt  time.Time `json:"submitted_at" firestore:"submitted_at"`
}

type QuoteRequestBody struct {
	Names       string `json:"names" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Phone       string `json:"phone"`
	EventType   string `json:"event_type" binding:"required"`
	EventDate   string `json:"event_date"`
	EventVenue  string `json:"event_venue"`
	Budget      string `json:"budget"`
	HearAboutUs string `json:"hear_about_us"`
	Message     string `json:"message" binding:"required"`
}
