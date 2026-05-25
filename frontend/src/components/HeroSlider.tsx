import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPublicHeroSlides } from "@/lib/publicApi";

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicHeroSlides()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSlides(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };
  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  };

  const imageVariants = {
    enter: (dir: number) => ({ opacity: 0, scale: 1.1, x: dir > 0 ? 100 : -100 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, scale: 1.05, x: dir > 0 ? -100 : 100 }),
  };

  // Loading state
  if (loading) {
    return (
      <section className="relative h-[100vh] bg-[hsl(220,30%,12%)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </section>
    );
  }

  // Empty state - no slides added yet
  if (slides.length === 0) {
    return (
      <section className="relative h-[100vh] bg-[hsl(220,30%,12%)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-5xl md:text-7xl text-white/80 tracking-wide mb-4">Ethereal Photography</h1>
          <div className="w-24 h-px bg-white/30 mx-auto my-6" />
          <p className="font-body text-sm text-white/50 tracking-[0.3em] uppercase">Add hero slides from the admin panel</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[100vh] overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image_url}
            alt={slides[current].alt_text || "Hero slide"}
            className="w-full h-full object-cover origin-center"
            width={1920}
            height={1080}
            style={{ animation: "kenburns 10s ease-out forwards" }}
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

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
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
