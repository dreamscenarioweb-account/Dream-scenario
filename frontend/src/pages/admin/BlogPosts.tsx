import { useState } from "react";
import type { BlogPost } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, uploadImage } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const BlogPosts = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "", category: "", excerpt: "", content: "",
    date: "", cover_image_url: "", display_order: 0, is_active: true,
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin_blog_posts"],
    queryFn: async () => {
      const res = await fetchBlogPosts();
      return res.data || [];
    },
  });
  const posts = Array.isArray(response) ? response : [];

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_blog_posts"] });
      toast.success("Tip created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create tip"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateBlogPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_blog_posts"] });
      toast.success("Tip updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update tip"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_blog_posts"] });
      toast.success("Tip deleted successfully");
    },
    onError: () => toast.error("Failed to delete tip"),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      setFormData((prev) => ({ ...prev, cover_image_url: res.data.url }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, display_order: Number(formData.display_order) };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (item: BlogPost) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category || "",
      excerpt: item.excerpt || "",
      content: item.content || "",
      date: item.date || "",
      cover_image_url: item.cover_image_url || "",
      display_order: item.display_order || 0,
      is_active: item.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ title: "", category: "", excerpt: "", content: "", date: "", cover_image_url: "", display_order: 0, is_active: true });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Tips</h1>
          <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Manage tips, inspiration, and blog content.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-body bg-black hover:bg-gray-900 text-white rounded-full px-5 shadow-md transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add Tip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editingItem ? "Edit Tip" : "Create Tip"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 font-body">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Category</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required placeholder="Tips, Planning, etc." className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Date</Label>
                  <Input id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} placeholder="March 15, 2024" className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Excerpt</Label>
                <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} required rows={3} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Full Content (Optional)</Label>
                <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_image" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Cover Image</Label>
                <div className="flex gap-2">
                  <Input id="cover_image" type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="flex-1 cursor-pointer border-[hsl(215,20%,90%)] rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin my-auto text-black" />}
                </div>
                {formData.cover_image_url && (
                  <div className="mt-2 aspect-video w-full relative rounded-lg overflow-hidden border border-[hsl(215,20%,90%)] shadow-sm">
                    <img src={formData.cover_image_url} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
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
                {editingItem ? "Update Tip" : "Create Tip"}
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
                <TableHead className="w-[100px] h-12">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-body text-sm">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-[hsl(215,15%,50%)]">Loading...</TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-[hsl(215,15%,50%)]">No tips found. Add your first tip above.</TableCell>
                </TableRow>
              ) : (
                posts.sort((a: BlogPost, b: BlogPost) => a.display_order - b.display_order).map((item: BlogPost) => (
                  <TableRow key={item.id} className="hover:bg-[hsl(0,0%,99%)]">
                    <TableCell>
                      {item.cover_image_url ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden shadow-sm border border-[hsl(215,20%,90%)]">
                          <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-[hsl(215,20%,90%)]">
                          <ImageIcon className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-black max-w-xs truncate">{item.title}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">{item.category}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">{item.date || "—"}</TableCell>
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
                        <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this tip?")) deleteMutation.mutate(item.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
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

export default BlogPosts;
