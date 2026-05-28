import api from "./api";

type ApiData = Record<string, unknown>;

// ── Albums ────────────────────────────────────────────────────────────────────
export const fetchAdminAlbums = () => api.get("/admin/albums");
export const createAlbum = (data: ApiData) => api.post("/admin/albums", data);
export const updateAlbum = (id: string, data: ApiData) => api.put(`/admin/albums/${id}`, data);
export const deleteAlbum = (id: string) => api.delete(`/admin/albums/${id}`);

export const fetchAlbumPhotos = (id: string) => api.get(`/admin/albums/${id}/photos`);
export const addAlbumPhoto = (id: string, data: ApiData) => api.post(`/admin/albums/${id}/photos`, data);
export const deletePhoto = (photoId: string) => api.delete(`/admin/photos/${photoId}`);
export const reorderPhotos = (id: string, photos: ApiData[]) =>
  api.put(`/admin/albums/${id}/photos/reorder`, { photos });

// ── Album Categories ──────────────────────────────────────────────────────────
export const fetchCategories = () => api.get("/admin/album-categories");
export const createCategory = (data: ApiData) => api.post("/admin/album-categories", data);
export const updateCategory = (id: string, data: ApiData) => api.put(`/admin/album-categories/${id}`, data);
export const deleteCategory = (id: string) => api.delete(`/admin/album-categories/${id}`);

// ── Hero Slides ───────────────────────────────────────────────────────────────
export const fetchHeroSlides = () => api.get("/admin/hero-slides");
export const createHeroSlide = (data: ApiData) => api.post("/admin/hero-slides", data);
export const updateHeroSlide = (id: string, data: ApiData) => api.put(`/admin/hero-slides/${id}`, data);
export const deleteHeroSlide = (id: string) => api.delete(`/admin/hero-slides/${id}`);

// ── Testimonials ──────────────────────────────────────────────────────────────
export const fetchTestimonials = () => api.get("/admin/testimonials");
export const createTestimonial = (data: ApiData) => api.post("/admin/testimonials", data);
export const updateTestimonial = (id: string, data: ApiData) => api.put(`/admin/testimonials/${id}`, data);
export const deleteTestimonial = (id: string) => api.delete(`/admin/testimonials/${id}`);

// ── Showcase Items ────────────────────────────────────────────────────────────
export const fetchShowcaseItems = () => api.get("/admin/showcase");
export const createShowcaseItem = (data: ApiData) => api.post("/admin/showcase", data);
export const updateShowcaseItem = (id: string, data: ApiData) => api.put(`/admin/showcase/${id}`, data);
export const deleteShowcaseItem = (id: string) => api.delete(`/admin/showcase/${id}`);

// ── Team Members ──────────────────────────────────────────────────────────────
export const fetchTeamMembers = () => api.get("/admin/team-members");
export const createTeamMember = (data: ApiData) => api.post("/admin/team-members", data);
export const updateTeamMember = (id: string, data: ApiData) => api.put(`/admin/team-members/${id}`, data);
export const deleteTeamMember = (id: string) => api.delete(`/admin/team-members/${id}`);

// ── Services ──────────────────────────────────────────────────────────────────
export const fetchServices = () => api.get("/admin/services");
export const createService = (data: ApiData) => api.post("/admin/services", data);
export const updateService = (id: string, data: ApiData) => api.put(`/admin/services/${id}`, data);
export const deleteService = (id: string) => api.delete(`/admin/services/${id}`);

// ── Blog Posts ─────────────────────────────────────────────────────────────────
export const fetchBlogPosts = () => api.get("/admin/blog-posts");
export const createBlogPost = (data: ApiData) => api.post("/admin/blog-posts", data);
export const updateBlogPost = (id: string, data: ApiData) => api.put(`/admin/blog-posts/${id}`, data);
export const deleteBlogPost = (id: string) => api.delete(`/admin/blog-posts/${id}`);

// ── Settings ──────────────────────────────────────────────────────────────────
export const fetchSettings = () => api.get("/admin/settings");
export const updateSettings = (data: Record<string, string>) => api.patch("/admin/settings", data);

// ── Contact Submissions ──────────────────────────────────────────────────────
export const fetchContactSubmissions = () => api.get("/admin/contact-submissions");
export const markContactRead = (id: string) => api.patch(`/admin/contact-submissions/${id}/read`);
export const deleteContactSubmission = (id: string) => api.delete(`/admin/contact-submissions/${id}`);

// ── Quote Requests ────────────────────────────────────────────────────────────
export const fetchQuoteRequests = () => api.get("/admin/quote-requests");
export const markQuoteRead = (id: string) => api.patch(`/admin/quote-requests/${id}/read`, { is_read: true });
export const deleteQuoteRequest = (id: string) => api.delete(`/admin/quote-requests/${id}`);

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── Public APIs ───────────────────────────────────────────────────────────────
export const fetchPublicAlbums = () => api.get("/albums");
export const fetchPublicAlbumBySlug = (slug: string) => api.get(`/albums/${slug}`);
export const fetchPublicCategories = () => api.get("/album-categories");
export const submitContact = (data: ApiData) => api.post("/contact", data);
export const submitQuote = (data: ApiData) => api.post("/quote-request", data);
