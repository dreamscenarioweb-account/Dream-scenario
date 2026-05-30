import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import defaultLogo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "About Us", path: "/about" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Tips", path: "/tips" },
  { label: "Contact Us", path: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { getSetting } = useSiteSettings();
  const siteName = getSetting("site_name");
  const logoUrl = getSetting("site_logo_url");
  const logoEnabled = getSetting("site_logo_enabled") === "true";

  // Scroll hiding & premium sizing logic
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
 
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 800);
    };
 
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-glass border-b border-border/40"
      >
        <div className={`container mx-auto flex items-center justify-between px-4 md:px-8 transition-all duration-500 ${isScrolled ? "py-3" : "py-5 md:py-6"}`}>
          <Link to="/" className="font-display text-2xl md:text-3xl font-light text-foreground z-50 flex items-center">
            {logoEnabled ? (
              <img 
                src={logoUrl || defaultLogo} 
                alt={siteName} 
                className={`w-auto transition-all duration-500 ${isScrolled ? "h-8 md:h-9" : "h-10 md:h-12"}`}
              />
            ) : (
              siteName
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              >
                <Link
                  to={link.path}
                  className={`font-body text-xs tracking-[0.15em] uppercase relative transition-colors hover:text-accent ${
                    location.pathname === link.path ? "text-accent" : "text-foreground"
                  }`}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="hidden lg:block z-50"
          >
            <Link
              to="/contact"
              className="font-body text-[11px] font-medium tracking-[0.2em] uppercase px-6 py-2.5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md transition-all duration-300"
            >
              Request a Quote
            </Link>
          </motion.div>

          <motion.button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-foreground p-2 z-50"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={24} />
          </motion.button>
        </div>
      </motion.header>

      {/* Full-screen Glass Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl lg:hidden flex flex-col"
          >
            <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-8">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="font-display text-2xl font-light text-foreground flex items-center"
              >
                {logoEnabled ? (
                  <img 
                    src={logoUrl || defaultLogo} 
                    alt={siteName} 
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  siteName
                )}
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-foreground p-2"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-16">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`font-display text-2xl tracking-[0.15em] uppercase hover:text-accent transition-all duration-300 ${
                      location.pathname === link.path ? "text-accent scale-105" : "text-foreground/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: navLinks.length * 0.05 + 0.1, duration: 0.4 }}
                className="mt-6"
              >
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-sm tracking-[0.2em] uppercase px-8 py-3 bg-primary text-primary-foreground shadow-luxury inline-block"
                >
                  Request a Quote
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
