import { useState } from "react";
import type { Service } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchServices, createService, updateService, deleteService, uploadImage } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { customIconsMap } from "@/components/CustomIcons";

const DynamicIcon = ({ name, className, strokeWidth = 2, size = 20 }: { name: string; className?: string; strokeWidth?: number; size?: number }) => {
  const CustomIconComponent = customIconsMap[name];
  if (CustomIconComponent) {
    return <CustomIconComponent className={className} size={size} />;
  }
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    return <LucideIcons.Briefcase className={className} strokeWidth={strokeWidth} size={size} />;
  }
  return <IconComponent className={className} strokeWidth={strokeWidth} size={size} />;
};

const CURATED_ICONS = [
  { name: "Weddings", label: "Weddings (Hearts/Flutes)" },
  { name: "Engagements", label: "Engagements (Diamond Ring)" },
  { name: "CasualShoots", label: "Casual Shoots (SLR Camera)" },
  { name: "Homecomings", label: "Homecomings (Floral Arch)" },
  { name: "Cinematography", label: "Cinematography (Film Camera)" },
  { name: "Photobooths", label: "Photobooths (Heart Balloons)" },
  { name: "Sparkles", label: "Sparkles" },
  { name: "Flower", label: "Flower" },
  { name: "GlassWater", label: "Glass" },
  { name: "MapPin", label: "Map Pin" },
  { name: "Users", label: "Users" },
  { name: "Award", label: "Award" },
  { name: "Gift", label: "Gift" },
  { name: "Music", label: "Music" },
];

const Services = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ title: "", icon_name: "", image_url: "", description: "", featuresStr: "", display_order: 0, is_active: true });
  const [isUploading, setIsUploading] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin_services"],
    queryFn: async () => {
      const res = await fetchServices();
      return res.data || [];
    },
  });
  const services = Array.isArray(response) ? response : [];

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_services"] });
      toast.success("Service created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create service"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_services"] });
      toast.success("Service updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update service"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_services"] });
      toast.success("Service deleted successfully");
    },
    onError: () => toast.error("Failed to delete service"),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      setFormData({ ...formData, image_url: res.data.url });
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = formData.featuresStr.split('\n').map(f => f.trim()).filter(f => f.length > 0);
    const payload = { 
      title: formData.title,
      icon_name: formData.icon_name || "Briefcase",
      image_url: formData.image_url || "placeholder",
      description: formData.description,
      features: features,
      display_order: Number(formData.display_order),
      is_active: formData.is_active
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (item: Service) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      icon_name: item.icon_name || "",
      image_url: item.image_url || "",
      description: item.description || "",
      featuresStr: Array.isArray(item.features) ? item.features.join("\n") : "",
      display_order: item.display_order || 0,
      is_active: item.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ title: "", icon_name: "", image_url: "", description: "", featuresStr: "", display_order: 0, is_active: true });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Services</h1>
          <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Manage your service offerings.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-body bg-black hover:bg-gray-900 text-white rounded-full px-5 shadow-md transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editingItem ? "Edit Service" : "Create Service"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 font-body">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Features (One per line)</Label>
                <Textarea id="features" value={formData.featuresStr} onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })} rows={4} placeholder="High-res photos&#10;Online gallery&#10;Drone footage" className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>

              {/* Curated Icon Selector Grid */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Select Icon</Label>
                <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded-lg border border-[hsl(215,20%,90%)] max-h-36 overflow-y-auto">
                  {CURATED_ICONS.map((ico) => {
                    const isSelected = formData.icon_name === ico.name;
                    return (
                      <button
                        type="button"
                        key={ico.name}
                        onClick={() => setFormData({ ...formData, icon_name: ico.name })}
                        title={ico.label}
                        className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-600 border-gray-200 hover:border-black"
                        }`}
                      >
                        <DynamicIcon name={ico.name} className="w-5 h-5" strokeWidth={1.2} size={20} />
                        <span className="text-[8px] mt-1 truncate max-w-full">{ico.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon_name" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Custom Icon (Lucide)</Label>
                  <Input id="icon_name" value={formData.icon_name} onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })} placeholder="Briefcase" className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Display Order</Label>
                  <Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Cover Image (Optional)</Label>
                <div className="flex gap-2">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="flex-1 cursor-pointer border-[hsl(215,20%,90%)] rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin my-auto text-black" />}
                </div>
                {formData.image_url && formData.image_url !== "placeholder" && (
                  <div className="mt-2 aspect-video w-full relative rounded-lg overflow-hidden border border-[hsl(215,20%,90%)] shadow-sm">
                    <img src={formData.image_url} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="is_active" 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })} 
                  className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                />
                <Label htmlFor="is_active" className="cursor-pointer text-sm">Active / Visible</Label>
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading} className="w-full bg-black hover:bg-gray-900 text-white rounded-lg py-3 mt-2 font-medium">
                {editingItem ? "Update Service" : "Create Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(0,0%,98%)] hover:bg-[hsl(0,0%,98%)] font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                <TableHead className="w-[80px] h-12">Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-body text-sm">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-[hsl(215,15%,50%)]">Loading...</TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-[hsl(215,15%,50%)]">No services found.</TableCell>
                </TableRow>
              ) : (
                services.sort((a: Service, b: Service) => a.display_order - b.display_order).map((item: Service) => (
                  <TableRow key={item.id} className="hover:bg-[hsl(0,0%,99%)]">
                    <TableCell>
                      <div className="w-12 h-12 rounded-full bg-[hsl(206,21%,63%)] flex items-center justify-center text-white shadow-sm">
                        <DynamicIcon name={item.icon_name} className="w-6 h-6" strokeWidth={1.2} size={24} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-black">{item.title}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">{item.display_order || 0}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider ${item.is_active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-[hsl(215,15%,50%)]"}`}>
                        {item.is_active ? "Active" : "Hidden"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-[hsl(215,15%,50%)] hover:text-black rounded-lg">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this service?")) deleteMutation.mutate(item.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Services;
