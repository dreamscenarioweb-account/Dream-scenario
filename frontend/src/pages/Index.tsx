import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Layout from "@/components/Layout";
import HeroSlider from "@/components/HeroSlider";
import SectionTitle from "@/components/SectionTitle";
import { ScrollReveal, StaggerReveal, StaggerItem, HoverCard } from "@/components/animations";
import { fetchPublicServices, fetchPublicAlbums, fetchPublicTestimonials, fetchPublicBlogPosts, fetchPublicShowcase } from "@/lib/publicApi";
import { customIconsMap } from "@/components/CustomIcons";
import type { Service, Album, Testimonial, BlogPost, ShowcaseItem } from "@/types";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import hero3 from "@/assets/hero-3.jpg";

const DynamicIcon = ({ name, className, strokeWidth = 2, size = 32 }: { name: string; className?: string; strokeWidth?: number; size?: number }) => {
  const CustomIconComponent = customIconsMap[name];
  if (CustomIconComponent) {
    return <CustomIconComponent className={className} size={size} strokeWidth={strokeWidth} />;
  }
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    return <LucideIcons.Briefcase className={className} strokeWidth={strokeWidth} size={size} />;
  }
  return <IconComponent className={className} strokeWidth={strokeWidth} size={size} />;
};

const Index = () => {
  const { getSetting } = useSiteSettings();
  const sloganTitle = getSetting("slogan_title");
  const sloganSubtitle = getSetting("slogan_subtitle");
  const sloganDescription = getSetting("slogan_description");
  const sloganImageUrl = getSetting("slogan_image_url");

  const [services, setServices] = useState<Service[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tips, setTips] = useState<BlogPost[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPublicServices().catch(() => ({ data: [] })),
      fetchPublicAlbums().catch(() => ({ data: [] })),
      fetchPublicTestimonials().catch(() => ({ data: [] })),
      fetchPublicBlogPosts().catch(() => ({ data: [] })),
      fetchPublicShowcase().catch(() => ({ data: [] })),
    ]).then(([servicesRes, albumsRes, testimonialsRes, tipsRes, showcaseRes]) => {
      if (Array.isArray(servicesRes.data)) setServices(servicesRes.data);
      if (Array.isArray(albumsRes.data)) setAlbums(albumsRes.data.slice(0, 6));
      if (Array.isArray(testimonialsRes.data)) setTestimonials(testimonialsRes.data.slice(0, 3));
      if (Array.isArray(tipsRes.data)) setTips(tipsRes.data.slice(0, 2));
      if (Array.isArray(showcaseRes.data)) {
        const activeShowcase = showcaseRes.data
          .filter((item: ShowcaseItem) => item.is_active !== false)
          .sort((a: ShowcaseItem, b: ShowcaseItem) => (a.display_order || 0) - (b.display_order || 0));
        setShowcaseItems(activeShowcase);
      }
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <HeroSlider />

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <SectionTitle
              title="Our Services"
              subtitle="With 8 years of experience in capturing celebrations across the globe, our team is here to make sure you have the best day of your life."
              titleClassName="uppercase !text-2xl md:!text-4xl"
            />
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 mt-12">
              {services.sort((a, b) => a.display_order - b.display_order).slice(0, 3).map((s: Service) => (
                <StaggerItem key={s.id || s.title}>
                  <HoverCard className="text-center flex flex-col items-center h-full max-w-sm mx-auto transition-transform duration-500 hover:scale-[1.02]">
                    {/* Circle Icon Container */}
                    <div className="w-24 h-24 bg-[hsl(206,21%,63%)] hover:bg-[hsl(206,21%,58%)] rounded-full flex items-center justify-center mb-6 text-white shadow-md transition-colors duration-500">
                      <DynamicIcon name={s.icon_name} className="w-16 h-16" strokeWidth={0.5} size={64} />
                    </div>

                    <h3 className="font-display text-lg tracking-[0.2em] uppercase text-primary mb-3">
                      {s.title}
                    </h3>
                    
                    <p className="font-body text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xs mb-6 flex-grow font-light">
                      {s.description}
                    </p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerReveal>
            <ScrollReveal className="text-center mt-10">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/services"
                  className="inline-block font-body text-xs font-medium tracking-[0.15em] uppercase px-10 py-4 bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-500 rounded-sm"
                >
                  Know More
                </Link>
              </motion.div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Slogan Section */}
      <section className="relative py-12 bg-muted/20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Left Image column */}
            <div className="md:col-span-5 relative z-10 mb-8 md:mb-0 flex items-center justify-center">
              <ScrollReveal className="w-full">
                <div className="overflow-hidden rounded-sm shadow-xl">
                  <motion.img
                    src={sloganImageUrl || hero3}
                    alt={sloganTitle}
                    className="w-full h-auto object-contain z-10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                  />
                </div>
              </ScrollReveal>
            </div>
            {/* Right Slogan Text column — slides in from behind the image */}
            <div className="md:col-span-7 md:pl-8 space-y-6">
              <ScrollReveal
                variants={{ hidden: { opacity: 0, x: -200 }, visible: { opacity: 1, x: 0 } }}
                delay={0.3}
              >
                <span className="font-body text-xs md:text-sm text-accent tracking-[0.25em] uppercase block mb-2">
                  {sloganSubtitle}
                </span>
                <h2 className="font-display text-2xl md:text-4xl text-primary leading-snug uppercase mb-4">
                  {sloganTitle}
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-loose font-light max-w-xl">
                  {sloganDescription}
                </p>
                <div className="pt-4">
                  <Link
                    to="/slogan"
                    className="inline-flex items-center gap-4 font-body text-xs font-semibold tracking-[0.2em] uppercase text-foreground hover:text-accent transition-colors pl-4 border-l border-foreground hover:border-accent py-1"
                  >
                    Read More
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Stories We've Told / Showcase Section */}
      {showcaseItems.length > 0 && (
        <section className="dark-showcase bg-muted/20 text-foreground">
          <div className="container mx-auto px-4">
            <SectionTitle title="Stories We've Told" titleClassName="uppercase !text-2xl md:!text-4xl" />
          </div>
          
          <div className="showcase-track-container">
            <div className="showcase-track">
              {[...showcaseItems, ...showcaseItems].map((item, index) => (
                <motion.div 
                  key={`${item.id}-${index}`}
                  className="showcase-item"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: (index % showcaseItems.length) * 0.1 }}
                >
                  <div className="showcase-image-wrap group">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      loading="lazy"
                    />

                    <div className="showcase-grain" />
                  </div>
                  <div className="showcase-meta">
                    <span className="showcase-category">
                      {item.category}
                    </span>
                    <h3 className="showcase-item-title text-foreground">
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          

        </section>
      )}

      {/* Featured Albums */}
      {albums.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <SectionTitle
              title="Featured Albums"
              subtitle="Throughout the years we have had the opportunity to photograph many wonderful couples."
              titleClassName="uppercase !text-2xl md:!text-4xl"
            />
            <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((a: Album) => (
                <StaggerItem key={a.id || a.title} className="group relative overflow-hidden block rounded-sm shadow-sm">
                  <Link to={a.slug ? `/portfolio/${a.slug}` : "/portfolio"} className="block w-full h-full">
                    <motion.img
                      src={a.cover_image_url}
                      alt={a.title}
                      loading="lazy"
                      width={800}
                      height={800}
                      className="w-full aspect-[3/2] object-cover rounded-sm"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.7 }}
                    />
                    <div className="absolute inset-0 bg-hero-overlay/0 group-hover:bg-hero-overlay/30 transition-all duration-500 flex items-end p-6">
                      <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="font-display text-xl text-primary-foreground">{a.title}</h3>
                        <p className="font-body text-xs text-primary-foreground/70">{a.category || "Wedding Shoot"}</p>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerReveal>
            <ScrollReveal className="text-center mt-10">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link
                  to="/portfolio"
                  className="inline-block font-body text-xs font-medium tracking-[0.15em] uppercase px-10 py-4 bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-500 rounded-sm"
                >
                  View All Albums
                </Link>
              </motion.div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-foreground py-20 px-4">
          <div className="container mx-auto">
            <SectionTitle
              title="What Others Have Experienced"
              subtitle="You deserve the absolute best. That's why we want to make sure we are the right choice for you."
              light
              titleClassName="!text-2xl md:!text-4xl"
            />
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t: Testimonial) => (
                <StaggerItem key={t.id || t.couple}>
                  <HoverCard className="bg-background/5 border border-primary-foreground/10 p-10 h-full backdrop-blur-sm hover:bg-background/10 transition-colors flex flex-col justify-center items-center text-center rounded-lg shadow-luxury">
                    {t.image_url && (
                      <div className="mb-6">
                        <img 
                          src={t.image_url} 
                          alt={t.couple} 
                          className="w-24 h-24 rounded-full object-cover border-2 border-accent/50 shadow-lg mx-auto"
                        />
                      </div>
                    )}
                    <span className="text-accent text-5xl font-display leading-[0] block mb-4 opacity-50">"</span>
                    <p className="font-body text-sm md:text-base text-primary-foreground/90 leading-loose italic mb-8 flex-grow font-light">
                      {t.quote}
                    </p>
                    <h4 className="font-display text-xl md:text-2xl text-accent">{t.couple}</h4>
                    <div className="w-12 h-px bg-primary-foreground/20 mt-4 mx-auto" />
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>
      )}

      {/* Tips Preview */}
      {tips.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <SectionTitle
              title="Wedding Inspiration & Tips"
              subtitle="Wedding Planning Tips to better organise your wedding & make your wedding unforgettable!"
            />
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tips.map((tip: BlogPost) => (
                <StaggerItem key={tip.id || tip.title}>
                  <Link to="/tips" className="group block">
                    <span className="font-body text-xs tracking-[0.1em] uppercase text-accent">{tip.category || "Tips"}</span>
                    <h3 className="font-display text-2xl mt-2 mb-2 group-hover:text-accent transition-colors">{tip.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{tip.excerpt}</p>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 text-center overflow-hidden bg-primary">
        <ScrollReveal>
          <h2 className="font-display text-2xl md:text-4xl text-primary-foreground mb-4">
            Ready to Tell Your Story?
          </h2>
          <p className="font-body text-sm text-primary-foreground/70 mb-8 max-w-lg mx-auto">
            Let us capture the moments that matter most. Get in touch to discuss your special day.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link
              to="/contact"
              className="inline-block font-body text-xs font-medium tracking-[0.15em] uppercase px-12 py-5 bg-background text-foreground hover:bg-accent border border-transparent hover:text-accent-foreground shadow-luxury hover:shadow-luxury-hover transition-all duration-500 translate-y-0 hover:-translate-y-1 rounded-sm"
            >
              Request a Quote
            </Link>
          </motion.div>
        </ScrollReveal>
      </section>
    </Layout>
  );
};

export default Index;
