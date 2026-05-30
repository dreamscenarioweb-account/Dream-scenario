import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import hero1 from "@/assets/hero-1.jpg";

const Slogan = () => {
  const { getSetting } = useSiteSettings();

  const title = getSetting("slogan_title");
  const subtitle = getSetting("slogan_subtitle");
  const description = getSetting("slogan_description_full");
  const imageUrl = getSetting("slogan_image_url") || hero1;

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover origin-center"
          width={1920}
          height={1080}
          style={{ animation: "kenburns 15s ease-out forwards" }}
        />
        <div className="absolute inset-0 bg-hero-overlay/40 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 text-center px-4 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-4xl md:text-6xl text-white drop-shadow-xl tracking-wide uppercase leading-tight">
            {title}
          </h1>
        </motion.div>
      </section>

      {/* Slogan Content */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-8 font-body text-base md:text-lg text-muted-foreground leading-loose font-light text-center">
            {description.split('\n\n').map((paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="pt-16 text-center">
            <span className="font-display text-4xl md:text-5xl font-light text-primary block">
              Dream Scenario
            </span>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Slogan;
