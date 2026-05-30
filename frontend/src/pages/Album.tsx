import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import NotFound from "./NotFound";
import { ScrollReveal, StaggerReveal, fadeUp } from "@/components/animations";
import { fetchPublicAlbumBySlug } from "@/lib/publicApi";
import type { Album, Photo } from "@/types";

const JustifiedImage = ({
  photo,
  onClick,
  index,
}: {
  photo: Photo;
  onClick: () => void;
  index: number;
}) => {
  const [ratio, setRatio] = useState(1.5);

  useEffect(() => {
    const img = new Image();
    img.src = photo.url;
    if (img.complete) {
      if (img.naturalWidth && img.naturalHeight) {
        setRatio(img.naturalWidth / img.naturalHeight);
      }
    } else {
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setRatio(img.naturalWidth / img.naturalHeight);
        }
      };
    }
  }, [photo.url]);

  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        flexGrow: ratio,
        flexBasis: `calc(var(--row-height) * ${ratio})`,
        height: "var(--row-height)",
      }}
      className="[--row-height:199px] md:[--row-height:300px] lg:[--row-height:500px] relative overflow-hidden cursor-pointer group rounded-sm shadow-sm"
      onClick={onClick}
      whileHover={{ y: -4 }}
    >
      <motion.img
        src={photo.url}
        alt={photo.alt_text || `Photo ${index + 1}`}
        loading="lazy"
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.7 }}
      />
      {/* Lightbox / Action Overlay */}
      <div className="absolute inset-0 bg-hero-overlay/0 group-hover:bg-hero-overlay/20 transition-all duration-500 flex items-center justify-center">
        <span className="text-white/0 group-hover:text-white/90 font-body text-[10px] tracking-[0.25em] uppercase transition-all duration-500 opacity-0 group-hover:opacity-100">
          
        </span>
      </div>
    </motion.div>
  );
};

const Album = () => {
  const { id } = useParams();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [album, setAlbum] = useState<(Album & { photos?: Photo[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPublicAlbumBySlug(id)
        .then((res) => {
          setAlbum(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <section className="relative h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </section>
      </Layout>
    );
  }

  if (error || !album) {
    return <NotFound />;
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={album.cover_image_url}
          alt={album.title}
          className="absolute inset-0 w-full h-full object-cover origin-center"
          width={1920}
          height={1080}
          style={{ animation: "kenburns 15s ease-out forwards" }}
        />
        <div className="absolute inset-0 bg-hero-overlay/40 backdrop-blur-[2px]" />
        
        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-5xl md:text-7xl text-white drop-shadow-xl tracking-wide mb-4">
            {album.title}
          </h1>
          <p className="font-body text-sm md:text-base text-white/90 tracking-[0.3em] uppercase mt-6">
            {album.category?.toUpperCase() || ''} SHOOT
          </p>
        </motion.div>
      </section>

      {/* Back Button & Intro */}
      <section className="bg-background pt-12 pb-8 px-4">
        <div className="container mx-auto">
          <Link 
            to="/portfolio" 
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-accent transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            Back to Portfolio
          </Link>
          
          <ScrollReveal className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-4xl mb-6 text-primary">The Gallery</h2>
            <p className="font-body text-sm md:text-base text-muted-foreground leading-loose font-light">
              Relive the magical moments from this beautiful {album.category?.toLowerCase() || 'photo'} shoot. Every detail, every emotion—captured to last a lifetime.
            </p>
          </ScrollReveal>

          {/* Photos Justified Grid */}
          {album.photos && album.photos.length > 0 ? (
            <StaggerReveal className="flex flex-wrap gap-2.5 mt-8">
              {album.photos.map((photo: Photo, i: number) => (
                <JustifiedImage
                  key={photo.id || i}
                  photo={photo}
                  onClick={() => setLightbox(i)}
                  index={i}
                />
              ))}
              {/* Spacer element to prevent last row from stretching if it's incomplete */}
              <div
                style={{ flexGrow: 9999, flexBasis: "9999px" }}
                className="[--row-height:199px] md:[--row-height:300px] lg:[--row-height:500px] h-[var(--row-height)] pointer-events-none"
              />
            </StaggerReveal>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No photos have been added to this album yet.
            </div>
          )}
        </div>
      </section>

      {/* Lightbox for individual photos within the album */}
      <AnimatePresence>
        {lightbox !== null && album.photos && album.photos[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.button
              className="absolute top-6 right-6 text-white/70 hover:text-white z-50"
              onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
              aria-label="Close"
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <X size={32} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              src={album.photos[lightbox].url}
              alt={album.photos[lightbox].alt_text || `${album.title} - Full Size`}
              className="max-w-full max-h-[90vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Album;
