import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SectionTitle from "@/components/SectionTitle";
import { ScrollReveal } from "@/components/animations";
import { fetchPublicAlbums, fetchPublicCategories } from "@/lib/publicApi";
import type { Album, AlbumCategory } from "@/types";
import hero3 from "@/assets/hero-3.jpg";

const Portfolio = () => {
  const [filter, setFilter] = useState("All");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPublicAlbums().catch(() => ({ data: [] })),
      fetchPublicCategories().catch(() => ({ data: [] })),
    ]).then(([albumsRes, catsRes]) => {
      const albumData = Array.isArray(albumsRes.data) ? albumsRes.data : [];
      const catData = Array.isArray(catsRes.data) ? catsRes.data : [];

      setAlbums(albumData);
      if (catData.length > 0) {
        const catNames = catData.map((c: AlbumCategory) => c.name);
        setCategories(["All", ...catNames]);
      } else {
        const uniqueCats = [...new Set(albumData.map((a: Album) => a.category).filter(Boolean))];
        if (uniqueCats.length > 0) setCategories(["All", ...uniqueCats]);
      }
      setLoading(false);
    });
  }, []);

  const filtered = filter === "All"
    ? albums
    : albums.filter((a: Album) => a.category === filter);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={hero3}
          alt="Portfolio"
          className="absolute inset-0 w-full h-full object-cover origin-center"
          width={1920}
          height={1080}
          style={{ animation: "kenburns 15s ease-out forwards" }}
        />
        <div className="absolute inset-0 bg-hero-overlay/30 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-6xl md:text-8xl text-white drop-shadow-xl tracking-wide">Portfolio</h1>
          <p className="font-body text-sm md:text-base text-white/90 tracking-[0.3em] uppercase mt-6">OUR AMAZING WORK</p>
        </motion.div>
      </section>

      {/* Gallery */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <SectionTitle
            title="Our Amazing Work"
            subtitle="We want to capture the way your relationship feels, the way your hands touch and faces meet."
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : albums.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 font-body">Portfolio albums coming soon. Check back later!</p>
          ) : (
            <>
              {/* Filter */}
              {categories.length > 1 && (
                <ScrollReveal className="flex justify-center gap-6 mb-12 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`font-body text-xs tracking-[0.1em] uppercase pb-1 border-b-2 transition-colors relative ${
                        filter === cat ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                      {filter === cat && (
                        <motion.span
                          layoutId="filter-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </ScrollReveal>
              )}

              {/* Grid */}
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((item: Album, i: number) => (
                    <motion.div
                      key={`${item.id}-${item.category}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="group relative overflow-hidden cursor-pointer"
                    >
                      <Link to={`/portfolio/${item.slug || item.id}`} className="block w-full h-full">
                        <motion.img
                          src={item.cover_image_url}
                          alt={item.title}
                          loading="lazy"
                          width={800}
                          height={800}
                          className="w-full h-72 object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.7 }}
                        />
                        <div className="absolute inset-0 bg-hero-overlay/0 group-hover:bg-hero-overlay/60 transition-all duration-500 flex items-end p-6">
                          <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <h3 className="font-display text-xl text-primary-foreground">{item.title}</h3>
                            <p className="font-body text-xs text-primary-foreground/70">{item.category || "Wedding Shoot"}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;
