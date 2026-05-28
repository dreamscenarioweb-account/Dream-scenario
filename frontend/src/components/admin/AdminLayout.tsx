import { useState, type ElementType } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Images, List, FileText,
  Layers, MessageSquareQuote, Briefcase, Users,
  LogOut, Menu, FileEdit, Cog
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: ElementType;
}

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Albums", path: "/admin/albums", icon: Images },
  { label: "Categories", path: "/admin/categories", icon: List },
  { label: "Quotes", path: "/admin/messages", icon: FileText },
];

const contentItems = [
  { label: "Hero Slides", path: "/admin/hero-slides", icon: Layers },
  { label: "Testimonials", path: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Services", path: "/admin/services", icon: Briefcase },
  { label: "Team Members", path: "/admin/team", icon: Users },
  { label: "Tips", path: "/admin/blog-posts", icon: FileEdit },
  { label: "Settings", path: "/admin/settings", icon: Cog },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    const [pathname, search] = path.split("?");
    if (path === "/admin") return location.pathname === "/admin";
    if (search) {
      return location.pathname === pathname && location.search === `?${search}`;
    }
    return location.pathname.startsWith(pathname) && !location.search;
  };

  const SidebarLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl font-body text-sm font-medium transition-colors ${
          active ? "bg-[hsl(0,0%,96%)] text-black" : "text-[hsl(215,15%,50%)] hover:bg-[hsl(0,0%,98%)] hover:text-black"
        }`}
      >
        <Icon size={18} strokeWidth={2} className={active ? "text-black" : "text-[hsl(215,15%,50%)]"} />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)] flex font-body">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-[hsl(215,20%,90%)] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-8">
          <Link to="/admin" className="block w-fit">
            <h1 className="font-display text-2xl font-bold tracking-tight text-black mb-2">captured</h1>
            <span className="inline-block px-2 py-1 bg-[hsl(210,20%,98%)] rounded text-[10px] font-bold tracking-widest uppercase text-[hsl(215,15%,50%)]">
              Admin Panel
            </span>
          </Link>
        </div>

        <div className="flex-1 px-4 overflow-y-auto space-y-8 pb-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarLink key={item.label} item={item} />
            ))}
          </nav>

          <nav className="space-y-1">
            <h3 className="px-4 text-[10px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-3">Content</h3>
            {contentItems.map((item) => (
              <SidebarLink key={item.label} item={item} />
            ))}
          </nav>
        </div>

        <div className="p-6">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-full border border-[hsl(215,20%,90%)] font-body text-sm font-medium text-[hsl(215,15%,50%)] hover:bg-[hsl(0,0%,98%)] hover:text-black transition-colors"
          >
            <LogOut size={16} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen max-w-[1400px]">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b border-[hsl(215,20%,90%)] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-display text-xl font-bold tracking-tight text-black">captured</h1>
          <button onClick={() => setSidebarOpen(true)} className="text-black">
            <Menu size={24} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

