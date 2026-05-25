import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, uploadImage } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const Testimonials = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ image_url: "", quote: "", couple: "", location: "", rating: 5, display_order: 0, is_active: true });
  const [isUploading, setIsUploading] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin_testimonials"],
    queryFn: async () => {
      const res = await fetchTestimonials();
      return res.data || [];
    },
  });
  const testimonials = Array.isArray(response) ? response : [];

  const createMutation = useMutation({
    mutationFn: (data: any) => createTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_testimonials"] });
      toast.success("Testimonial created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create testimonial"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_testimonials"] });
      toast.success("Testimonial updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update testimonial"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_testimonials"] });
      toast.success("Testimonial deleted successfully");
    },
    onError: () => toast.error("Failed to delete testimonial"),
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
    const payload = { ...formData, rating: Number(formData.rating), display_order: Number(formData.display_order) };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      image_url: item.image_url || "",
      quote: item.quote,
      couple: item.couple,
      location: item.location || "",
      rating: item.rating || 5,
      display_order: item.display_order || 0,
      is_active: item.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ image_url: "", quote: "", couple: "", location: "", rating: 5, display_order: 0, is_active: true });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Testimonials</h1>
          <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Manage client reviews and testimonials.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-body bg-black hover:bg-gray-900 text-white rounded-full px-5 shadow-md transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editingItem ? "Edit Testimonial" : "Create Testimonial"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 font-body">
              <div className="space-y-2">
                <Label htmlFor="couple" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Couple / Name</Label>
                <Input id="couple" value={formData.couple} onChange={(e) => setFormData({ ...formData, couple: e.target.value })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Location / Event</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Quote</Label>
                <Textarea id="quote" value={formData.quote} onChange={(e) => setFormData({ ...formData, quote: e.target.value })} required rows={4} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Rating (1-5)</Label>
                  <Input id="rating" type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Display Order</Label>
                  <Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Photo (Optional)</Label>
                <div className="flex gap-2">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="flex-1 cursor-pointer border-[hsl(215,20%,90%)] rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin my-auto text-black" />}
                </div>
                {formData.image_url && (
                  <div className="mt-2 w-20 h-20 relative rounded-full overflow-hidden border border-[hsl(215,20%,90%)] shadow-sm">
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
                {editingItem ? "Update Testimonial" : "Create Testimonial"}
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
                <TableHead className="w-[80px] h-12">Photo</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-body text-sm">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-[hsl(215,15%,50%)]">Loading...</TableCell>
                </TableRow>
              ) : testimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-[hsl(215,15%,50%)]">No testimonials found.</TableCell>
                </TableRow>
              ) : (
                testimonials.sort((a: any, b: any) => a.display_order - b.display_order).map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-[hsl(0,0%,99%)]">
                    <TableCell>
                      {item.image_url ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-[hsl(215,20%,90%)]">
                          <img src={item.image_url} alt="Client" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-[hsl(215,20%,90%)]">
                          <ImageIcon className="h-4 w-4 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-black">{item.couple}</p>
                      <div className="flex items-center text-yellow-400 mt-1">
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-[hsl(215,15%,50%)] text-sm">{item.quote}</TableCell>
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
                        <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this testimonial?")) deleteMutation.mutate(item.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
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

export default Testimonials;
