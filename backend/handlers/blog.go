package handlers

import (
	"encoding/json"
	"net/http"
)

type BlogPost struct {
	ID       int    `json:"id"`
	Category string `json:"category"`
	Title    string `json:"title"`
	Excerpt  string `json:"excerpt"`
	Image    string `json:"image"`
	Date     string `json:"date"`
	Author   string `json:"author,omitempty"`
}

var featuredPost = BlogPost{
	ID:       0,
	Category: "Featured Story",
	Title:    "A Magical Sunset Wedding at the Southern Coast",
	Excerpt:  "When golden light meets the ocean breeze, every moment becomes a masterpiece. Join us as we relive this breathtaking celebration of love.",
	Image:    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
	Date:     "February 10, 2025",
	Author:   "Lensero Team",
}

var posts = []BlogPost{
	{
		ID:       1,
		Category: "Wedding Tips",
		Title:    "The Art of Golden Hour Photography",
		Excerpt:  "Discover how the warm glow of golden hour transforms your wedding portraits into timeless works of art.",
		Image:    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80",
		Date:     "Jan 15, 2025",
	},
	{
		ID:       2,
		Category: "Behind the Lens",
		Title:    "A Coastal Love Story in Mirissa",
		Excerpt:  "Join us as we relive the magical moments from an intimate beach wedding ceremony.",
		Image:    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=700&q=80",
		Date:     "Dec 20, 2024",
	},
	{
		ID:       3,
		Category: "Inspiration",
		Title:    "Planning Your Dream Destination Wedding",
		Excerpt:  "Everything you need to know about planning a breathtaking destination wedding in Sri Lanka.",
		Image:    "https://images.unsplash.com/photo-1661328117163-d1fb9d28f751?auto=format&fit=crop&w=700&q=80",
		Date:     "Nov 10, 2024",
	},
	{
		ID:       4,
		Category: "Style Guide",
		Title:    "Bridal Elegance: Trending Looks for 2025",
		Excerpt:  "From classic lace to modern minimalism, explore the bridal styles defining this year's wedding season.",
		Image:    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80",
		Date:     "Oct 5, 2024",
	},
	{
		ID:       5,
		Category: "Wedding Tips",
		Title:    "Choosing Your Perfect Venue",
		Excerpt:  "A guide to finding a wedding venue that complements your vision and personality as a couple.",
		Image:    "https://images.unsplash.com/photo-1684895603976-6ba905f8d237?auto=format&fit=crop&w=700&q=80",
		Date:     "Sep 18, 2024",
	},
	{
		ID:       6,
		Category: "Behind the Lens",
		Title:    "The Magic of Candid Moments",
		Excerpt:  "Why the unscripted, candid moments often become the most treasured photographs of your day.",
		Image:    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80",
		Date:     "Aug 22, 2024",
	},
}

type BlogResponse struct {
	FeaturedPost BlogPost   `json:"featuredPost"`
	Posts        []BlogPost `json:"posts"`
}

func HandleGetPosts(w http.ResponseWriter, r *http.Request) {
	response := BlogResponse{
		FeaturedPost: featuredPost,
		Posts:        posts,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
