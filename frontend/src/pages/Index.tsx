import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import HeroSlider from "@/components/HeroSlider";
import SectionTitle from "@/components/SectionTitle";
import { ScrollReveal, StaggerReveal, StaggerItem, fadeLeft, fadeRight, HoverCard } from "@/components/animations";
import { fetchPublicServices, fetchPublicAlbums, fetchPublicTestimonials, fetchPublicBlogPosts } from "@/lib/publicApi";

const Index = () => {
  const [services, setServices] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPublicServices().catch(() => ({ data: [] })),
      fetchPublicAlbums().catch(() => ({ data: [] })),
      fetchPublicTestimonials().catch(() => ({ data: [] })),
      fetchPublicBlogPosts().catch(() => ({ data: [] })),
    ]).then(([servicesRes, albumsRes, testimonialsRes, tipsRes]) => {
      if (Array.isArray(servicesRes.data)) setServices(servicesRes.data);
      if (Array.isArray(albumsRes.data)) setAlbums(albumsRes.data.slice(0, 6));
      if (Array.isArray(testimonialsRes.data)) setTestimonials(testimonialsRes.data.slice(0, 3));
      if (Array.isArray(tipsRes.data)) setTips(tipsRes.data.slice(0, 2));
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <HeroSlider />

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <SectionTitle
              title="Our Services"
              subtitle="With 8 years of experience in capturing celebrations across the globe, our team is here to make sure you have the best day of your life."
            />
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((s: any) => (
                <StaggerItem key={s.id || s.title}>
                  <HoverCard className="text-center">
                    <div className="overflow-hidden mb-6">
                      <motion.img
                        src={s.image_url}
                        alt={s.title}
                        loading="lazy"
                        width={800}
                        height={1000}
                        className="w-full h-80 object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                    <h3 className="font-display text-2xl mb-3">{s.title}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.description}</p>
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

      {/* Featured Albums */}
      {albums.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <SectionTitle
              title="Featured Albums"
              subtitle="Throughout the years we have had the opportunity to photograph many wonderful couples."
            />
            <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((a: any) => (
                <StaggerItem key={a.id || a.title}>
                  <Link to={a.slug ? `/portfolio/${a.slug}` : "/portfolio"} className="group relative overflow-hidden block">
                    <motion.img
                      src={a.cover_image_url}
                      alt={a.title}
                      loading="lazy"
                      width={800}
                      height={800}
                      className="w-full h-72 object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.7 }}
                    />
                    <div className="absolute inset-0 bg-hero-overlay/0 group-hover:bg-hero-overlay/60 transition-all duration-500 flex items-end p-6">
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
            />
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t: any) => (
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
              {tips.map((tip: any) => (
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
      <section className="bg-primary py-20 px-4 text-center overflow-hidden">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-5xl text-primary-foreground mb-4">
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
