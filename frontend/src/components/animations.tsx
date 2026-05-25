import { motion, type Variants } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

// Reusable animation variants
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Scroll-triggered wrapper
interface ScrollRevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
  once?: boolean;
}

export const ScrollReveal = ({
  children,
  variants = fadeUp,
  className = "",
  delay = 0,
  once = true,
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger wrapper for grids/lists
interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  fast?: boolean;
}

export const StaggerReveal = ({ children, className = "", fast }: StaggerRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fast ? staggerFast : staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual stagger child
export const StaggerItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={fadeUp}
    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Parallax image wrapper
export const ParallaxImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading,
}: {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}) => (
  <motion.div className="overflow-hidden" whileHover={{ scale: 1.02 }} transition={{ duration: 0.6 }}>
    <motion.img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  </motion.div>
);

// Hover card effect
export const HoverCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.div>
);

// Animated counter for stats
export const AnimatedNumber = ({ value, className = "" }: { value: string; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className={className}
    >
      {value}
    </motion.span>
  );
};
