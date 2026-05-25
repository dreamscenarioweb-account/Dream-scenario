import api from "./api";

// Public CMS API - fetches data for public-facing pages

export const fetchPublicHeroSlides = () => api.get("/hero-slides");
export const fetchPublicTestimonials = () => api.get("/testimonials");
export const fetchPublicShowcase = () => api.get("/showcase");
export const fetchPublicServices = () => api.get("/services");
export const fetchPublicSettings = () => api.get("/settings");
export const fetchPublicTeamMembers = () => api.get("/team-members");
export const fetchPublicBlogPosts = () => api.get("/blog-posts");
export const fetchPublicAlbums = () => api.get("/albums");
export const fetchPublicAlbumBySlug = (slug: string) => api.get(`/albums/${slug}`);
export const fetchPublicCategories = () => api.get("/album-categories");
export const submitContact = (data: any) => api.post("/contact", data);
export const submitQuote = (data: any) => api.post("/quote-request", data);
