export interface HeroSlide {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  image_url: string;
  quote: string;
  couple: string;
  location: string;
  rating: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ShowcaseItem {
  id: string;
  image_url: string;
  title: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  icon_name: string;
  image_url: string;
  description: string;
  features: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  cover_image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover_image_url: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  url: string;
  alt_text: string;
  display_order: number;
  created_at: string;
}

export interface AlbumCategory {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface QuoteRequest {
  id: string;
  names: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string | null;
  event_venue: string;
  budget: string;
  hear_about_us: string;
  message: string;
  is_read: boolean;
  submitted_at: string;
}

export type SiteSettings = Record<string, string>;
