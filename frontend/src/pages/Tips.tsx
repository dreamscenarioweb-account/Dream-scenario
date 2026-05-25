import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SectionTitle from "@/components/SectionTitle";
import { StaggerReveal, StaggerItem, HoverCard } from "@/components/animations";
import { fetchPublicBlogPosts } from "@/lib/publicApi";

const Tips = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicBlogPosts()
      .then((res) => {
        if (Array.isArray(res.data)) setBlogPosts(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[hsl(220,30%,15%)]">
        <div className="absolute inset-0 bg-hero-overlay/10 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-5xl md:text-7xl text-white drop-shadow-xl tracking-wide">Tips & Inspiration</h1>
          <div className="w-24 h-px bg-white/30 mx-auto my-6" />
          <p className="font-body text-sm md:text-base text-white/80 tracking-[0.3em] uppercase">WEDDING PLANNING MADE EASY</p>
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
          ) : blogPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 font-body">Blog posts coming soon. Check back later!</p>
          ) : (
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {blogPosts.map((post: any) => (
                <StaggerItem key={post.id || post.title}>
                  <HoverCard className="h-full bg-card border border-border/50 shadow-luxury hover:shadow-luxury-hover p-8 rounded-md hover:bg-card/80 transition-all duration-500">
                    <article className="group flex flex-col h-full">
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
