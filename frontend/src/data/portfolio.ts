import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";
import album4 from "@/assets/album-4.jpg";
import album5 from "@/assets/album-5.jpg";
import album6 from "@/assets/album-6.jpg";
import servicesWedding from "@/assets/services-wedding.jpg";
import servicesEngagement from "@/assets/services-engagement.jpg";
import servicesCasual from "@/assets/services-casual.jpg";
import aboutPhoto from "@/assets/about-photo.jpg";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";

export const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
};

export const categories = ["All", "Fine Art", "Artistic", "Vintage"];

export const galleryItems = [
  { id: generateSlug("Sanushki & Ridham"), src: album1, title: "Sanushki & Ridham", cat: "Fine Art", photos: [album1, album2, album3, album4, album5, album6] },
  { id: generateSlug("Inami & Dimuth"), src: album2, title: "Inami & Dimuth", cat: "Artistic", photos: [album2, hero1, hero2, album4, album5] },
  { id: generateSlug("Sabina & Zakaria"), src: album3, title: "Sabina & Zakaria", cat: "Vintage", photos: [album3, servicesWedding, servicesEngagement, servicesCasual] },
  { id: generateSlug("Senadie & Sanuth"), src: album4, title: "Senadie & Sanuth", cat: "Fine Art", photos: [album4, album5, album6, aboutPhoto] },
  { id: generateSlug("Yass & Hass"), src: album5, title: "Yass & Hass", cat: "Artistic", photos: [album5, album6, hero1, hero2, servicesWedding] },
  { id: generateSlug("Olga & Pavel"), src: album6, title: "Olga & Pavel", cat: "Vintage", photos: [album6, album1, album2, album3] },
  { id: generateSlug("Wedding Details"), src: servicesWedding, title: "Wedding Details", cat: "Fine Art", photos: [servicesWedding, hero1, hero2] },
  { id: generateSlug("Engagement Session"), src: servicesEngagement, title: "Engagement Session", cat: "Artistic", photos: [servicesEngagement, servicesCasual, aboutPhoto] },
  { id: generateSlug("Casual Portraits"), src: servicesCasual, title: "Casual Portraits", cat: "Vintage", photos: [servicesCasual, servicesWedding, hero1] },
  { id: generateSlug("First Dance"), src: aboutPhoto, title: "First Dance", cat: "Fine Art", photos: [aboutPhoto, album1, album2, album3] },
  { id: generateSlug("Garden Ceremony"), src: hero1, title: "Garden Ceremony", cat: "Artistic", photos: [hero1, hero2, album4, album5] },
  { id: generateSlug("Classic Elegance"), src: hero2, title: "Classic Elegance", cat: "Fine Art", photos: [hero2, servicesWedding, servicesEngagement, servicesCasual] },
];
