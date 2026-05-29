import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Layout from "@/components/Layout";
import SectionTitle from "@/components/SectionTitle";
import { ScrollReveal, StaggerReveal, StaggerItem, HoverCard } from "@/components/animations";
import { fetchPublicServices } from "@/lib/publicApi";
import type { Service } from "@/types";
import hero2 from "@/assets/hero-2.jpg";

const DynamicIcon = ({ name, className, strokeWidth = 2 }: { name: string; className?: string; strokeWidth?: number }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    return <LucideIcons.Briefcase className={className} strokeWidth={strokeWidth} />;
  }
  return <IconComponent className={className} strokeWidth={strokeWidth} />;
};

const Services = () => {
  const [servicesList, setServicesList] = useState<Service[]>([]);
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
            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 mt-16">
              {servicesList.sort((a, b) => a.display_order - b.display_order).map((service: Service, i: number) => (
                <StaggerItem key={service.id || service.title}>
                  <HoverCard className="text-center p-8 bg-white border border-[hsl(215,20%,90%)] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-500 flex flex-col items-center h-full">
                    {/* Circle Icon Container */}
                    <div className="w-20 h-20 bg-[hsl(206,21%,63%)] hover:bg-[hsl(206,21%,58%)] rounded-full flex items-center justify-center mb-6 text-white shadow-md transition-colors duration-500">
                      <DynamicIcon name={service.icon_name} className="w-8 h-8" strokeWidth={1.5} />
                    </div>

                    <h3 className="font-display text-lg tracking-[0.2em] uppercase text-primary mb-3">
                      {service.title}
                    </h3>
                    
                    <div className="w-8 h-px bg-accent/40 mb-4" />

                    <p className="font-body text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xs mb-6 flex-grow font-light">
                      {service.description}
                    </p>

                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 border-t border-[hsl(215,20%,95%)] pt-4 w-full text-center">
                        {service.features.map((f: string) => (
                          <li key={f} className="font-body text-xs text-muted-foreground/80 flex items-center justify-center gap-2">
                            <span className="w-1 h-1 bg-[hsl(206,21%,63%)] rounded-full" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
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

export default Services;
