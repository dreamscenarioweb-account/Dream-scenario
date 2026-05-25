import { ReactNode, useEffect, forwardRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";

const MainContent = forwardRef<HTMLElement, { children: ReactNode }>(
  ({ children }, ref) => (
    <main ref={ref} className="flex-1">
      {children}
    </main>
  )
);
MainContent.displayName = "MainContent";

const MotionMain = motion.create(MainContent);

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <MotionMain
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </MotionMain>
      <Footer />
    </div>
  );
};

export default Layout;
