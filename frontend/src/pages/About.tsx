import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SectionTitle from "@/components/SectionTitle";
import { ScrollReveal, StaggerReveal, StaggerItem, fadeLeft, fadeRight, AnimatedNumber } from "@/components/animations";
import { fetchPublicTeamMembers, fetchPublicSettings } from "@/lib/publicApi";
import type { TeamMember } from "@/types";
import hero1 from "@/assets/hero-1.jpg";
import { Camera, Heart, Award, Globe } from "lucide-react";

const About = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPublicTeamMembers().catch(() => ({ data: [] })),
      fetchPublicSettings().catch(() => ({ data: {} })),
    ]).then(([teamRes, settingsRes]) => {
      if (Array.isArray(teamRes.data)) setTeamMembers(teamRes.data);
      if (settingsRes.data && typeof settingsRes.data === "object") setSettings(settingsRes.data);
      setLoading(false);
    });
  }, []);

  const siteName = settings.site_name || "Our Studio";
  const aboutTitle = settings.about_title || siteName;
  const aboutTagline = settings.about_tagline || "Allow us to capture your magic.";
  const aboutDescription = settings.about_description || "";
  const aboutDescription2 = settings.about_description_2 || "";
  const aboutImageUrl = settings.about_image_url || "";
  const statsWeddings = settings.stat_weddings || "500+";
  const statsHappyCouples = settings.stat_happy_couples || "500+";
  const statsYears = settings.stat_years || "8+";
  const statsCountries = settings.stat_countries || "15+";

  const stats = [
    { icon: Camera, label: "Weddings Captured", value: statsWeddings },
    { icon: Heart, label: "Happy Couples", value: statsHappyCouples },
    { icon: Award, label: "Years Experience", value: statsYears },
    { icon: Globe, label: "Countries", value: statsCountries },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={hero1}
          alt="About Us"
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
          <h1 className="font-display text-6xl md:text-8xl text-white drop-shadow-xl tracking-wide">About Us</h1>
          <p className="font-body text-sm md:text-base text-white/90 tracking-[0.3em] uppercase mt-6">OUR STORY & PASSION</p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal variants={fadeLeft}>
            <h2 className="font-display text-5xl md:text-6xl mb-8 text-primary">{aboutTitle}</h2>
            <p className="font-display text-xl md:text-2xl text-accent/80 italic mb-8 leading-relaxed">
              "{aboutTagline}"
            </p>
            {aboutDescription && (
              <p className="font-body text-sm md:text-base text-muted-foreground leading-loose mb-6 font-light">
                {aboutDescription}
              </p>
            )}
            {aboutDescription2 && (
              <p className="font-body text-sm md:text-base text-muted-foreground leading-loose font-light">
                {aboutDescription2}
              </p>
            )}
          </ScrollReveal>
          <ScrollReveal variants={fadeRight} delay={0.2}>
            {aboutImageUrl ? (
              <img src={aboutImageUrl} alt="About us" className="w-full h-[500px] object-cover" />
            ) : (
              <div className="h-[500px] bg-[hsl(220,20%,92%)] flex items-center justify-center">
                <p className="font-body text-sm text-muted-foreground">Add about photo from admin settings</p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-16 px-4 overflow-hidden">
        <StaggerReveal className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <div className="text-center">
                <motion.div whileHover={{ rotate: 10, scale: 1.2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <s.icon className="mx-auto mb-3 text-primary-foreground/80" size={28} />
                </motion.div>
                <AnimatedNumber value={s.value} className="font-display text-4xl text-primary-foreground block" />
                <p className="font-body text-xs text-primary-foreground/60 tracking-wider uppercase mt-1">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </section>

      {/* Team */}
      {teamMembers.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <SectionTitle title="Our Team" subtitle="A passionate group of creatives dedicated to capturing your most precious moments." />
            <StaggerReveal className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member: TeamMember) => (
                <StaggerItem key={member.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm">
                  <div className="text-center">
                    <div className="overflow-hidden mb-4">
                      <motion.img
                        src={member.image_url}
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-72 object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                    <h3 className="font-display text-2xl">{member.name}</h3>
                    <p className="font-body text-sm text-accent mt-1">{member.role}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-section-alt py-20 px-4 text-center">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-5xl mb-4">Let's Create Something Beautiful</h2>
          <p className="font-body text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
            We'd love to hear about your wedding plans and how we can make your day unforgettable.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link
              to="/contact"
              className="inline-block font-body text-xs font-medium tracking-[0.15em] uppercase px-12 py-5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-luxury hover:shadow-luxury-hover transition-all duration-300 translate-y-0 hover:-translate-y-0.5 hover:scale-[1.01] active:scale-95 rounded-sm"
            >
              Get in Touch
            </Link>
          </motion.div>
        </ScrollReveal>
      </section>
    </Layout>
  );
};

export default About;
