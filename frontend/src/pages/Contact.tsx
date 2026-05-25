import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionTitle from "@/components/SectionTitle";
import { ScrollReveal, StaggerReveal, StaggerItem, fadeLeft, fadeRight } from "@/components/animations";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import hero3 from "@/assets/hero-3.jpg";
import { useToast } from "@/hooks/use-toast";
import { fetchPublicSettings, submitQuote } from "@/lib/publicApi";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", date: "", venue: "", message: "", service: "wedding",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPublicSettings()
      .then((res) => {
        if (res.data && typeof res.data === "object") {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitQuote({
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: form.date,
        venue: form.venue,
        message: form.message,
        service: form.service,
      });
      toast({ title: "Thank you!", description: "We've received your inquiry and will get back to you within 24 hours." });
      setForm({ name: "", email: "", phone: "", date: "", venue: "", message: "", service: "wedding" });
    } catch {
      toast({ title: "Error", description: "Failed to send your message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const contactEmail = settings.contact_email || "info@etherealphotography.com";
  const contactPhone = settings.contact_phone || "+1 (555) 123-4567";
  const contactAddress = settings.address || "Worldwide Coverage";
  const instagramUrl = settings.instagram_url || "#";
  const facebookUrl = settings.facebook_url || "#";

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={hero3}
          alt="Contact"
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
          <h1 className="font-display text-6xl md:text-8xl text-white drop-shadow-xl tracking-wide">Contact Us</h1>
          <div className="w-24 h-px bg-white/50 mx-auto my-6" />
          <p className="font-body text-sm md:text-base text-white/90 tracking-[0.3em] uppercase">LET'S PLAN YOUR SPECIAL DAY</p>
        </motion.div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <SectionTitle title="Request a Quote" subtitle="Fill out the form below and we'll get back to you within 24 hours." />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <ScrollReveal variants={fadeLeft} className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Your Name *", name: "name", type: "text", required: true },
                    { label: "Email Address *", name: "email", type: "email", required: true },
                    { label: "Phone Number", name: "phone", type: "tel" },
                    { label: "Wedding Date", name: "date", type: "date" },
                    { label: "Venue / Location", name: "venue", type: "text" },
                  ].map((field, i) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                    >
                      <label className="font-body text-xs tracking-[0.1em] uppercase text-muted-foreground block mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        required={field.required}
                        className="w-full border-t-0 border-l-0 border-r-0 border-b border-border bg-transparent px-0 py-3 font-body text-sm text-foreground focus:outline-none focus:border-accent focus:ring-0 transition-colors"
                      />
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <label className="font-body text-xs tracking-[0.1em] uppercase text-muted-foreground block mb-2">Service Type</label>
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full border-t-0 border-l-0 border-r-0 border-b border-border bg-transparent px-0 py-3 font-body text-sm text-foreground focus:outline-none focus:border-accent focus:ring-0 transition-colors"
                    >
                      <option value="wedding">Wedding Photography</option>
                      <option value="engagement">Engagement Shoot</option>
                      <option value="casual">Casual Shoot</option>
                      <option value="other">Other</option>
                    </select>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <label className="font-body text-xs tracking-[0.1em] uppercase text-muted-foreground block mb-2">Your Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full border-t-0 border-l-0 border-r-0 border-b border-border bg-transparent px-0 py-3 font-body text-sm text-foreground focus:outline-none focus:border-accent focus:ring-0 transition-colors resize-none"
                    placeholder="Tell us about your special day..."
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.4 }}
                  className="pt-4"
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-block font-body text-xs font-medium tracking-[0.15em] uppercase px-12 py-5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-luxury hover:shadow-luxury-hover transition-all duration-500 translate-y-0 hover:-translate-y-1 rounded-sm w-full md:w-auto disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </motion.button>
                </motion.div>
              </form>
            </ScrollReveal>

            {/* Contact Info */}
            <ScrollReveal variants={fadeRight} delay={0.3}>
              <StaggerReveal className="space-y-8">
                <StaggerItem>
                  <h3 className="font-display text-2xl mb-4">Contact Info</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Mail, label: "Email", value: contactEmail },
                      { icon: Phone, label: "Phone", value: contactPhone },
                      { icon: MapPin, label: "Location", value: contactAddress },
                    ].map((item) => (
                      <motion.div
                        key={item.label}
                        className="flex items-start gap-3"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <item.icon size={18} className="text-accent mt-0.5" />
                        <div>
                          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                          <p className="font-body text-sm">{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <h3 className="font-display text-2xl mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    <motion.a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label="Instagram"
                      whileHover={{ scale: 1.3, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Instagram size={22} />
                    </motion.a>
                    <motion.a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label="Facebook"
                      whileHover={{ scale: 1.3, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Facebook size={22} />
                    </motion.a>
                    <motion.a
                      href="#"
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label="YouTube"
                      whileHover={{ scale: 1.3, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Youtube size={22} />
                    </motion.a>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bg-section-alt p-6">
                    <h4 className="font-display text-xl mb-2">Office Hours</h4>
                    <p className="font-body text-sm text-muted-foreground">Monday – Friday: 9am – 6pm</p>
                    <p className="font-body text-sm text-muted-foreground">Saturday: 10am – 4pm</p>
                    <p className="font-body text-sm text-muted-foreground">Sunday: By appointment only</p>
                  </div>
                </StaggerItem>
              </StaggerReveal>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
