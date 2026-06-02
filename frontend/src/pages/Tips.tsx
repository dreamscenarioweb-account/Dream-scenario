import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import hero5 from "@/assets/hero-5.jpg";
import Layout from "@/components/Layout";
import SectionTitle from "@/components/SectionTitle";
import { StaggerReveal, StaggerItem, HoverCard } from "@/components/animations";
import { fetchPublicBlogPosts } from "@/lib/publicApi";
import type { BlogPost } from "@/types";

const DEFAULTS = { content: "", is_active: true, created_at: "", display_order: 0 };

const SAMPLE_TIPS: BlogPost[] = [
  {
    ...DEFAULTS,
    id: "sample-1",
    title: "Golden Hour Magic: Capturing Breathtaking Wedding Portraits",
    category: "Lighting",
    date: "June 2025",
    cover_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    excerpt:
      "The hour just before sunset is a photographer's greatest gift. We'll show you how to build your wedding timeline around this magical window to create portraits glowing with warmth, depth, and romance that no studio light can replicate.",
  },
  {
    ...DEFAULTS,
    id: "sample-2",
    title: "Engagement Shoot Styling: Your Complete Guide to Looking Naturally You",
    category: "Planning",
    date: "May 2025",
    cover_image_url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&auto=format&fit=crop&q=80",
    excerpt:
      "Your engagement session is the perfect rehearsal for your wedding day. From choosing outfits that complement without matching, to finding locations that tell your love story — here's everything you need to walk in front of the camera feeling completely at ease.",
  },
  {
    ...DEFAULTS,
    id: "sample-3",
    title: "Building the Perfect Wedding Day Timeline for a Stunning Gallery",
    category: "Organisation",
    date: "April 2025",
    cover_image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
    excerpt:
      "A thoughtfully crafted timeline is the invisible backbone of every breathtaking wedding gallery. Discover how to build in buffer time, schedule your portraits during golden hour, and ensure not a single meaningful moment slips through the cracks.",
  },
  {
    ...DEFAULTS,
    id: "sample-4",
    title: "First Look vs. Aisle Reveal: Which Tradition is Right for You?",
    category: "Tips",
    date: "March 2025",
    cover_image_url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&auto=format&fit=crop&q=80",
    excerpt:
      "One of the most emotional decisions couples face is whether to see each other before the ceremony. We walk you through the heartfelt, practical, and photographic pros and cons of both options so you can choose the moment that's authentically yours.",
  },
];

const Tips = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicBlogPosts()
      .then((res) => {
        if (Array.isArray(res.data)) setBlogPosts(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayPosts = blogPosts.length > 0 ? blogPosts : SAMPLE_TIPS;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={hero5}
          alt="Tips & Inspiration"
          className="absolute inset-0 w-full h-full object-cover origin-center"
          width={1920}
          height={1080}
          style={{ animation: "kenburns 15s ease-out forwards" }}
        />
        <div className="absolute inset-0 bg-hero-overlay/30 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-5xl md:text-7xl text-white drop-shadow-xl tracking-wide">Tips & Inspiration</h1>
          <p className="font-body text-sm md:text-base text-white/80 tracking-[0.3em] uppercase mt-6">WEDDING PLANNING MADE EASY</p>
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <SectionTitle
            title="Wedding Inspiration & Tips"
            subtitle="Wedding Planning Tips to better organise your wedding & make your wedding unforgettable!"
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {displayPosts.map((post: BlogPost) => (
                <StaggerItem key={post.id || post.title}>
                  <HoverCard className="h-full bg-card border border-border/50 shadow-luxury hover:shadow-luxury-hover rounded-md hover:bg-card/80 transition-all duration-500 overflow-hidden">
                    <article className="group flex flex-col h-full">
                      {post.cover_image_url && (
                        <div className="aspect-[16/9] w-full overflow-hidden">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      )}
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-5">
                          <span className="font-body text-xs tracking-[0.1em] uppercase text-accent font-medium">{post.category}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="font-body text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <h3 className="font-display text-2xl md:text-3xl mb-4 group-hover:text-accent transition-colors duration-300">{post.title}</h3>
                        <p className="font-body text-sm md:text-base text-muted-foreground leading-loose mb-6 font-light flex-grow">{post.excerpt}</p>
                        <div className="mt-auto">
                          <span className="font-body text-xs uppercase tracking-widest text-[hsl(215,15%,50%)] group-hover:text-accent transition-colors pb-1 border-b border-transparent group-hover:border-accent inline-block">Read More</span>
                        </div>
                      </div>
                    </article>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerReveal>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Tips;
