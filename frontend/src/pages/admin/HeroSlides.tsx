import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, uploadImage } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const HeroSlides = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [formData, setFormData] = useState({ image_url: "", alt_text: "", display_order: 0, is_active: true });
  const [isUploading, setIsUploading] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin_hero_slides"],
    queryFn: async () => {
      const res = await fetchHeroSlides();
      return res.data || [];
    },
  });
  const slides = Array.isArray(response) ? response : [];

  const createMutation = useMutation({
    mutationFn: (data: any) => createHeroSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_hero_slides"] });
      toast.success("Hero slide created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create slide"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateHeroSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_hero_slides"] });
      toast.success("Hero slide updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update slide"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHeroSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_hero_slides"] });
      toast.success("Hero slide deleted successfully");
    },
    onError: () => toast.error("Failed to delete slide"),
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
    const payload = { ...formData, display_order: Number(formData.display_order) };
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (slide: any) => {
    setEditingSlide(slide);
    setFormData({
      image_url: slide.image_url,
      alt_text: slide.alt_text,
      display_order: slide.display_order || 0,
      is_active: slide.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSlide(null);
    setFormData({ image_url: "", alt_text: "", display_order: 0, is_active: true });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Hero Slides</h1>
          <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Manage the homepage carousel images.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-body bg-black hover:bg-gray-900 text-white rounded-full px-5 shadow-md transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-display">{editingSlide ? "Edit Slide" : "Create Slide"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 font-body">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Image</Label>
                <div className="flex gap-2">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="flex-1 cursor-pointer border-[hsl(215,20%,90%)] rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin my-auto text-black" />}
                </div>
                {formData.image_url && (
                  <div className="mt-2 aspect-video w-full relative rounded-lg overflow-hidden border border-[hsl(215,20%,90%)] shadow-sm">
                    <img src={formData.image_url} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="alt_text" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Alt Text</Label>
                <Input id="alt_text" value={formData.alt_text} onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Display Order</Label>
                <Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
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
                {editingSlide ? "Update Slide" : "Create Slide"}
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
                <TableHead className="w-[120px] h-12">Image</TableHead>
                <TableHead>Alt Text</TableHead>
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
              ) : slides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-[hsl(215,15%,50%)]">No slides found.</TableCell>
                </TableRow>
              ) : (
                slides.sort((a: any, b: any) => a.display_order - b.display_order).map((slide: any) => (
                  <TableRow key={slide.id} className="hover:bg-[hsl(0,0%,99%)]">
                    <TableCell>
                      {slide.image_url ? (
                        <div className="w-20 h-10 rounded-lg overflow-hidden shadow-sm border border-[hsl(215,20%,90%)]">
                          <img src={slide.image_url} alt="Slide" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-[hsl(215,20%,90%)]">
                          <ImageIcon className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-black max-w-xs truncate">{slide.alt_text || "—"}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">{slide.display_order || 0}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider ${slide.is_active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-[hsl(215,15%,50%)]"}`}>
                        {slide.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(slide)} className="text-[hsl(215,15%,50%)] hover:text-black rounded-lg">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this slide?")) deleteMutation.mutate(slide.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
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

export default HeroSlides;
