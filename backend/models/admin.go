package models

import "time"

type AdminUser struct {
	ID           string     `json:"id" firestore:"id"`
	Email        string     `json:"email" firestore:"email"`
	PasswordHash string     `json:"-" firestore:"password_hash"`
	Name         string     `json:"name" firestore:"name"`
	CreatedAt    time.Time  `json:"created_at" firestore:"created_at"`
	LastLoginAt  *time.Time `json:"last_login_at" firestore:"last_login_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string     `json:"token"`
	Admin *AdminUser `json:"admin"`
}
