import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPublicHeroSlides } from "@/lib/publicApi";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import type { HeroSlide } from "@/types";

const FOCAL_POSITIONS: Record<string, string> = {
  "DtANYZmGmYiDKSdD5pLa": "center 75%",
  "ThI6YxUu5gACcVtEunNA": "center 75%",
  "hIyN0IbnhWN4qti9535q": "center 70%",
};

const getFocalPosition = (slide: HeroSlide | null) => {
  if (!slide) return "bottom";
  if (slide.alt_text) {
    const match = slide.alt_text.match(/\[focal:\s*([^\]]+)\]/);
    if (match && match[1]) return match[1].trim();
  }
  if (slide.id && FOCAL_POSITIONS[slide.id]) return FOCAL_POSITIONS[slide.id];
  return "bottom";
};

const imageVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const HeroSlider = () => {
  const { getSetting } = useSiteSettings();
  const siteName = getSetting("site_name");
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicHeroSlides()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) setSlides(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  if (loading) {
    return (
      <section className="relative h-[60vh] md:h-[100vh] bg-[hsl(220,30%,12%)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-[60vh] md:h-[100vh] bg-[hsl(220,30%,12%)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-5xl md:text-7xl text-white/80 tracking-wide mb-4">{siteName}</h1>
          <div className="w-24 h-px bg-white/30 mx-auto my-6" />
          <p className="font-body text-sm text-white/50 tracking-[0.3em] uppercase">Add hero slides from the admin panel</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[60vh] md:h-[100vh] overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={current}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image_url}
            alt={slides[current].alt_text || "Hero slide"}
            className="w-full h-full object-cover origin-center"
            width={1920}
            height={1080}
            style={{
              animation: "luxury-zoom 8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
              objectPosition: getFocalPosition(slides[current]),
            }}
          />
          <div className="absolute inset-0 bg-hero-overlay/30" />
        </motion.div>
      </AnimatePresence>



      {slides.length > 1 && (
        <>
          <motion.button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            aria-label="Previous slide"
            whileHover={{ x: -4, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={40} />
          </motion.button>
          <motion.button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            aria-label="Next slide"
            whileHover={{ x: 4, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={40} />
          </motion.button>
        </>
      )}

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_: HeroSlide, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="relative h-2 transition-all"
            style={{ width: i === current ? 24 : 8 }}
            aria-label={`Slide ${i + 1}`}
          >
            <span className={`block w-full h-full rounded-full ${i === current ? "bg-primary-foreground" : "bg-primary-foreground/50"}`} />
            {i === current && (
              <motion.span
                layoutId="slider-dot"
                className="absolute inset-0 rounded-full bg-primary-foreground"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
