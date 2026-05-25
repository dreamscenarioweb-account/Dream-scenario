import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { ScrollReveal, StaggerReveal, StaggerItem } from "./animations";
import { fetchPublicSettings } from "@/lib/publicApi";

const Footer = () => {
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

  const siteName = settings.site_name || "Ethereal Photography";
  const contactEmail = settings.contact_email || "info@etherealphotography.com";
  const contactPhone = settings.contact_phone || "+1 (555) 123-4567";
  const address = settings.address || "Worldwide Coverage";
  const instagramUrl = settings.instagram_url || "#";
  const facebookUrl = settings.facebook_url || "#";

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <StaggerItem>
            <h3 className="font-display text-3xl tracking-[0.15em] uppercase mb-4">
              {siteName}
            </h3>
            <p className="font-body text-sm leading-relaxed opacity-70">
              Light, airy, and beautifully ethereal. Capturing your love story with artistry and passion.
            </p>
            <div className="flex gap-4 mt-8">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 hover:text-accent transition-all duration-300" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 hover:text-accent transition-all duration-300" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 hover:text-accent transition-all duration-300" aria-label="YouTube">
                <Youtube size={24} />
              </a>
            </div>
          </StaggerItem>

          {/* Quick Links */}
          <StaggerItem>
            <h4 className="font-display text-xl mb-4">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Home", path: "/" },
                { label: "Services", path: "/services" },
                { label: "Portfolio", path: "/portfolio" },
                { label: "About Us", path: "/about" },
                { label: "Tips & Blog", path: "/tips" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-body text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </StaggerItem>

          {/* Contact Info */}
          <StaggerItem>
            <h4 className="font-display text-xl mb-4">Get in Touch</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Mail size={16} className="opacity-70" />
                <span className="font-body text-sm opacity-70">{contactEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="opacity-70" />
                <span className="font-body text-sm opacity-70">{contactPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="opacity-70" />
                <span className="font-body text-sm opacity-70">{address}</span>
              </div>
            </div>
          </StaggerItem>
        </StaggerReveal>

        <ScrollReveal delay={0.3}>
          <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
            <p className="font-body text-xs opacity-50">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

export default Footer;
