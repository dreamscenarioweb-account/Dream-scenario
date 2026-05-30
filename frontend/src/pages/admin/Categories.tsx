import { useState } from "react";
import type { Album, AlbumCategory } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, createCategory, updateCategory, deleteCategory, fetchAdminAlbums } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Categories = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AlbumCategory | null>(null);
  const [formData, setFormData] = useState({ name: "", display_order: 0 });

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin_categories"],
    queryFn: async () => {
      const res = await fetchCategories();
      return res.data || [];
    },
  });
  const categories = Array.isArray(response) ? response : [];

  const { data: albumsResponse } = useQuery({
    queryKey: ["admin_albums"],
    queryFn: async () => {
      const res = await fetchAdminAlbums();
      return res.data || [];
    },
  });
  const albums = Array.isArray(albumsResponse) ? albumsResponse : [];

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      toast.success("Category created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      toast.success("Category updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      toast.success("Category deleted successfully");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, display_order: Number(formData.display_order) };
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (cat: AlbumCategory) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, display_order: cat.display_order || 0 });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", display_order: 0 });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Categories</h1>
          <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Manage album categories.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-body bg-black hover:bg-gray-900 text-white rounded-full px-5 shadow-md transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-display">{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 font-body">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Display Order</Label>
                <Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-black hover:bg-gray-900 text-white rounded-lg py-3 mt-2 font-medium">
                {editingCategory ? "Update Category" : "Create Category"}
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
                <TableHead className="h-12">Name</TableHead>
                <TableHead>Albums Count</TableHead>
                <TableHead>Display Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-body text-sm">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32 text-[hsl(215,15%,50%)]">Loading...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32 text-[hsl(215,15%,50%)]">No categories found.</TableCell>
                </TableRow>
              ) : (
                categories.sort((a: AlbumCategory, b: AlbumCategory) => a.display_order - b.display_order).map((cat: AlbumCategory) => (
                  <TableRow key={cat.id} className="hover:bg-[hsl(0,0%,99%)]">
                    <TableCell className="font-medium text-black">{cat.name}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">
                      {albums.filter((a: Album) => a.category === cat.name).length}
                    </TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">{cat.display_order || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} className="text-[hsl(215,15%,50%)] hover:text-black rounded-lg">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this category?")) deleteMutation.mutate(cat.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
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

export default Categories;
