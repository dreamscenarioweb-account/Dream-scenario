import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Images, FileText, Mail } from "lucide-react";
import { fetchAdminAlbums, fetchContactSubmissions, fetchQuoteRequests } from "@/lib/adminApi";

const Dashboard = () => {
  const [stats, setStats] = useState({
    albums: 0,
    published: 0,
    drafts: 0,
    unreadQuotes: 0,
    unreadContacts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [albums, contacts, quotes] = await Promise.all([
          fetchAdminAlbums().catch(() => ({ data: [] })),
          fetchContactSubmissions().catch(() => ({ data: [] })),
          fetchQuoteRequests().catch(() => ({ data: [] })),
        ]);

        const albumData = Array.isArray(albums.data) ? albums.data : [];
        const contactData = Array.isArray(contacts.data) ? contacts.data : [];
        const quoteData = Array.isArray(quotes.data) ? quotes.data : [];

        setStats({
          albums: albumData.length,
          published: albumData.filter((a: any) => !a.is_draft).length,
          drafts: albumData.filter((a: any) => a.is_draft).length,
          unreadQuotes: quoteData.filter((q: any) => !q.is_read).length,
          unreadContacts: contactData.filter((c: any) => !c.is_read).length,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Dashboard</h1>
        <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Welcome back. Here's a quick overview of your site.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Stat Cards */}
        {[
          { label: "TOTAL ALBUMS", value: stats.albums, color: "bg-black" },
          { label: "PUBLISHED", value: stats.published, color: "bg-green-500" },
          { label: "DRAFTS", value: stats.drafts, color: "bg-black" },
          { label: "UNREAD QUOTES", value: stats.unreadQuotes, color: "bg-black" },
          { label: "UNREAD CONTACTS", value: stats.unreadContacts, color: "bg-black" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[hsl(215,20%,90%)] flex flex-col justify-center min-h-[140px]">
            <span className="font-display text-3xl font-bold text-black mb-4">{loading ? "-" : stat.value}</span>
            <div className={`w-6 h-0.5 ${stat.color} mb-3`}></div>
            <p className="font-body text-[10px] font-bold tracking-[0.1em] text-[hsl(215,15%,50%)]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="font-display text-xl font-bold text-black">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/albums" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[hsl(215,20%,90%)] rounded-full hover:bg-[hsl(0,0%,98%)] transition-colors font-body text-sm font-medium text-black shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <Images size={16} className="text-[hsl(215,15%,50%)]" />
            Manage Albums
          </Link>
          <Link to="/admin/albums/new" className="flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-full hover:bg-black transition-colors font-body text-sm font-medium shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
            <Plus size={16} className="text-white" />
            Add New Album
          </Link>
          <Link to="/admin/messages" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[hsl(215,20%,90%)] rounded-full hover:bg-[hsl(0,0%,98%)] transition-colors font-body text-sm font-medium text-black shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <FileText size={16} className="text-[hsl(215,15%,50%)]" />
            View Quotes
          </Link>
          <Link to="/admin/messages" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[hsl(215,20%,90%)] rounded-full hover:bg-[hsl(0,0%,98%)] transition-colors font-body text-sm font-medium text-black shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <Mail size={16} className="text-[hsl(215,15%,50%)]" />
            View Contacts
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="font-display text-xl font-bold text-black">Recent Albums</h2>
        <div className="text-sm font-body text-[hsl(215,15%,50%)]">
          {loading ? "Loading..." : "No recent albums to display."}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
