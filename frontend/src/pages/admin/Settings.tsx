import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings, uploadImage } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Checkbox } from "@/components/ui/checkbox";

const Settings = () => {
  const queryClient = useQueryClient();
  const { refreshSettings } = useSiteSettings();
  const [formData, setFormData] = useState<Record<string, string>>({
    site_name: "",
    site_logo_url: "",
    site_logo_enabled: "false",
    contact_email: "",
    contact_phone: "",
    address: "",
    instagram_url: "",
    facebook_url: "",
    about_title: "",
    about_tagline: "",
    about_description: "",
    about_description_2: "",
    about_image_url: "",
    stat_weddings: "",
    stat_happy_couples: "",
    stat_years: "",
    stat_countries: "",
    slogan_title: "",
    slogan_subtitle: "",
    slogan_description: "",
    slogan_description_full: "",
    slogan_image_url: "",
  });
  const [uploading, setUploading] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => {
      const res = await fetchSettings();
      return res.data || [];
    },
  });

  useEffect(() => {
    if (response && typeof response === "object" && !Array.isArray(response)) {
      setFormData((prev) => ({ ...prev, ...(response as Record<string, string>) }));
    }
  }, [response]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_settings"] });
      refreshSettings();
      toast.success("Settings updated successfully");
    },
    onError: () => toast.error("Failed to update settings"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setFormData({ ...formData, [field]: res.data.url });
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-[hsl(215,15%,50%)]">Loading settings...</div>;
  }

  const inputClass = "border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black h-11";
  const labelClass = "text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]";
  const sectionClass = "font-display text-xl text-black border-b border-[hsl(215,20%,90%)] pb-3";

  return (
    <div className="space-y-6 max-w-2xl pb-12">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Site Settings</h1>
        <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Manage global information, about page, and social links.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8">
        <form onSubmit={handleSubmit} className="space-y-8 font-body">
          {/* General Info */}
          <div className="space-y-6">
            <h3 className={sectionClass}>General Info</h3>
            <div className="space-y-2.5">
              <Label htmlFor="site_name" className={labelClass}>Site Name</Label>
              <Input id="site_name" value={formData.site_name || ""} onChange={handleChange} placeholder="Your Photography Studio" className={inputClass} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="contact_email" className={labelClass}>Public Contact Email</Label>
              <Input id="contact_email" type="email" value={formData.contact_email || ""} onChange={handleChange} placeholder="hello@yourstudio.com" className={inputClass} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="contact_phone" className={labelClass}>Contact Phone</Label>
              <Input id="contact_phone" value={formData.contact_phone || ""} onChange={handleChange} placeholder="+1 (555) 000-0000" className={inputClass} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="address" className={labelClass}>Address / Location</Label>
              <Textarea id="address" value={formData.address || ""} onChange={handleChange} rows={3} placeholder="City, Country" className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
            </div>
          </div>

          {/* Site Logo */}
          <div className="space-y-6 pt-2">
            <h3 className={sectionClass}>Site Logo</h3>
            <div className="space-y-2.5">
              <Label className={labelClass}>Logo Image</Label>
              {formData.site_logo_url && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex justify-center items-center max-w-xs shadow-sm">
                  <img src={formData.site_logo_url} alt="Logo Preview" className="h-12 object-contain" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <input type="file" id="site-logo-image" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "site_logo_url")} />
                <label htmlFor="site-logo-image" className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(215,20%,90%)] cursor-pointer hover:bg-gray-50 transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload Logo"}
                </label>
                {formData.site_logo_url && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, site_logo_url: "" })} className="text-red-500 text-xs">Remove</Button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="site_logo_enabled"
                checked={formData.site_logo_enabled === "true"}
                onCheckedChange={(checked) => setFormData({ ...formData, site_logo_enabled: checked ? "true" : "false" })}
                className="data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <Label htmlFor="site_logo_enabled" className="cursor-pointer text-sm font-semibold text-black">
                Enable Logo visibility (Displays logo image in navigation bar instead of text name)
              </Label>
            </div>
          </div>

          {/* About Us */}
          <div className="space-y-6 pt-2">
            <h3 className={sectionClass}>About Us Page</h3>
            <div className="space-y-2.5">
              <Label htmlFor="about_title" className={labelClass}>About Title</Label>
              <Input id="about_title" placeholder="e.g. Beyond Weddings" value={formData.about_title || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="about_tagline" className={labelClass}>About Tagline</Label>
              <Input id="about_tagline" placeholder="e.g. Allow us to capture your magic." value={formData.about_tagline || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="about_description" className={labelClass}>About Description (Paragraph 1)</Label>
              <Textarea id="about_description" value={formData.about_description || ""} onChange={handleChange} rows={4} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="about_description_2" className={labelClass}>About Description (Paragraph 2)</Label>
              <Textarea id="about_description_2" value={formData.about_description_2 || ""} onChange={handleChange} rows={4} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
            </div>
            <div className="space-y-2.5">
              <Label className={labelClass}>About Page Image</Label>
              {formData.about_image_url && (
                <img src={formData.about_image_url} alt="About" className="w-full h-48 object-cover rounded-lg mb-2" />
              )}
              <div className="flex items-center gap-3">
                <input type="file" id="about-image" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "about_image_url")} />
                <label htmlFor="about-image" className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(215,20%,90%)] cursor-pointer hover:bg-gray-50 transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload Image"}
                </label>
                {formData.about_image_url && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, about_image_url: "" })} className="text-red-500 text-xs">Remove</Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6 pt-2">
            <h3 className={sectionClass}>About Page Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="stat_weddings" className={labelClass}>Weddings Captured</Label>
                <Input id="stat_weddings" placeholder="e.g. 500+" value={formData.stat_weddings || ""} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="stat_happy_couples" className={labelClass}>Happy Couples</Label>
                <Input id="stat_happy_couples" placeholder="e.g. 500+" value={formData.stat_happy_couples || ""} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="stat_years" className={labelClass}>Years Experience</Label>
                <Input id="stat_years" placeholder="e.g. 8+" value={formData.stat_years || ""} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="stat_countries" className={labelClass}>Countries</Label>
                <Input id="stat_countries" placeholder="e.g. 15+" value={formData.stat_countries || ""} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Slogan Section */}
          <div className="space-y-6 pt-2">
            <h3 className={sectionClass}>Homepage Slogan Section</h3>
            <div className="space-y-2.5">
              <Label htmlFor="slogan_subtitle" className={labelClass}>Slogan Subtitle</Label>
              <Input id="slogan_subtitle" placeholder="e.g. BEYOND DESTINY" value={formData.slogan_subtitle || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="slogan_title" className={labelClass}>Slogan Title</Label>
              <Input id="slogan_title" placeholder="e.g. DESTINY HAS GOT YOU TOGETHER..." value={formData.slogan_title || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="slogan_description" className={labelClass}>Homepage Slogan Description (Short Excerpt)</Label>
              <Textarea id="slogan_description" value={formData.slogan_description || ""} onChange={handleChange} rows={3} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="slogan_description_full" className={labelClass}>Slogan Detail Page Description (Full Story)</Label>
              <Textarea id="slogan_description_full" value={formData.slogan_description_full || ""} onChange={handleChange} rows={6} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
            </div>
            <div className="space-y-2.5">
              <Label className={labelClass}>Slogan Photo</Label>
              {formData.slogan_image_url && (
                <img src={formData.slogan_image_url} alt="Slogan Preview" className="w-full h-48 object-cover rounded-lg mb-2" />
              )}
              <div className="flex items-center gap-3">
                <input type="file" id="slogan-image" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "slogan_image_url")} />
                <label htmlFor="slogan-image" className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(215,20%,90%)] cursor-pointer hover:bg-gray-50 transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload Image"}
                </label>
                {formData.slogan_image_url && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, slogan_image_url: "" })} className="text-red-500 text-xs">Remove</Button>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6 pt-2">
            <h3 className={sectionClass}>Social Links</h3>
            <div className="space-y-2.5">
              <Label htmlFor="instagram_url" className={labelClass}>Instagram URL</Label>
              <Input id="instagram_url" placeholder="https://instagram.com/..." value={formData.instagram_url || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="facebook_url" className={labelClass}>Facebook URL</Label>
              <Input id="facebook_url" placeholder="https://facebook.com/..." value={formData.facebook_url || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="pt-6 border-t border-[hsl(215,20%,90%)]">
            <Button type="submit" disabled={updateMutation.isPending} className="font-body bg-black hover:bg-gray-900 text-white rounded-full px-8 py-6 h-12 shadow-md transition-colors w-full sm:w-auto font-medium">
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
