import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SectionTitle from "@/components/SectionTitle";
import { ScrollReveal, StaggerReveal, StaggerItem, fadeLeft, fadeRight, HoverCard } from "@/components/animations";
import { fetchPublicServices } from "@/lib/publicApi";
import hero2 from "@/assets/hero-2.jpg";

const Services = () => {
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicServices()
      .then((res) => {
        if (Array.isArray(res.data)) setServicesList(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={hero2}
          alt="Services"
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
          <h1 className="font-display text-6xl md:text-8xl text-white drop-shadow-xl tracking-wide">Our Services</h1>
          <div className="w-24 h-px bg-white/50 mx-auto my-6" />
          <p className="font-body text-sm md:text-base text-white/90 tracking-[0.3em] uppercase">CAPTURING LIFE'S BEAUTIFUL MOMENTS</p>
        </motion.div>
      </section>

      {/* Services Detail */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <SectionTitle title="What We Offer" subtitle="With 8 years of experience in capturing celebrations across the globe, we offer a range of photography services tailored to your needs." />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : servicesList.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 font-body">Services coming soon. Check back later!</p>
          ) : (
            servicesList.map((service: any, i: number) => (
              <div key={service.id || service.title} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                <ScrollReveal variants={i % 2 === 0 ? fadeLeft : fadeRight} className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="overflow-hidden">
                    <motion.img
                      src={service.image_url}
                      alt={service.title}
                      loading="lazy"
                      width={800}
                      height={1000}
                      className="w-full h-[400px] object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                </ScrollReveal>
                <ScrollReveal variants={i % 2 === 0 ? fadeRight : fadeLeft} delay={0.2} className={`relative ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <span className="absolute -top-16 -left-8 text-[8rem] font-display text-accent/10 leading-none select-none z-[-1] pointer-events-none">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-4xl mb-6 text-primary">{service.title}</h3>
                  <div className="w-12 h-px bg-accent mb-6" />
                  <p className="font-body text-sm md:text-base text-muted-foreground leading-loose font-light">{service.description}</p>
                  {service.features && service.features.length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {service.features.map((f: string) => (
                        <li key={f} className="font-body text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollReveal>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Services;
