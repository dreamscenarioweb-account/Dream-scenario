import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Album from "./pages/Album";
import Tips from "./pages/Tips";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Albums from "./pages/admin/Albums";
import AlbumPhotos from "./pages/admin/AlbumPhotos";
import Categories from "./pages/admin/Categories";
import HeroSlides from "./pages/admin/HeroSlides";
import Testimonials from "./pages/admin/Testimonials";
import AdminServices from "./pages/admin/Services";
import Team from "./pages/admin/Team";
import Messages from "./pages/admin/Messages";
import Settings from "./pages/admin/Settings";
import BlogPosts from "./pages/admin/BlogPosts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:id" element={<Album />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="albums" element={<Albums />} />
              <Route path="albums/:id/photos" element={<AlbumPhotos />} />
              <Route path="categories" element={<Categories />} />
              <Route path="hero-slides" element={<HeroSlides />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="team" element={<Team />} />
              <Route path="messages" element={<Messages />} />
              <Route path="blog-posts" element={<BlogPosts />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
