import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminAlbums, createAlbum, updateAlbum, deleteAlbum, uploadImage } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Images } from "lucide-react";
import { toast } from "sonner";

const Albums = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", slug: "", category: "", cover_image_url: "", is_published: true });
  const [isUploading, setIsUploading] = useState(false);

  const { data: albumsResponse, isLoading } = useQuery({
    queryKey: ["admin_albums"],
    queryFn: async () => {
      const res = await fetchAdminAlbums();
      return res.data || [];
    },
  });
  const albums = Array.isArray(albumsResponse) ? albumsResponse : [];

  const createMutation = useMutation({
    mutationFn: (data: any) => createAlbum(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_albums"] });
      toast.success("Album created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create album"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAlbum(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_albums"] });
      toast.success("Album updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update album"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAlbum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_albums"] });
      toast.success("Album deleted successfully");
    },
    onError: () => toast.error("Failed to delete album"),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      setFormData({ ...formData, cover_image_url: res.data.url });
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAlbum) {
      updateMutation.mutate({ id: editingAlbum.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (album: any) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      slug: album.slug,
      category: album.category,
      cover_image_url: album.cover_image_url,
      is_published: album.is_published,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAlbum(null);
    setFormData({ title: "", slug: "", category: "", cover_image_url: "", is_published: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Albums</h1>
          <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Manage your photo albums and their metadata.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-body bg-black hover:bg-gray-900 text-white rounded-full px-5">
              <Plus className="mr-2 h-4 w-4" /> Add Album
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-display">{editingAlbum ? "Edit Album" : "Create New Album"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 font-body">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Slug (URL)</Label>
                <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Category</Label>
                <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Cover Image</Label>
                <div className="flex gap-2">
                  <Input id="cover" type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="flex-1 cursor-pointer border-[hsl(215,20%,90%)] rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin my-auto text-black" />}
                </div>
                {formData.cover_image_url && (
                  <div className="mt-2 aspect-video w-full relative rounded-lg overflow-hidden border border-[hsl(215,20%,90%)] shadow-sm">
                    <img src={formData.cover_image_url} alt="Cover Preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading} className="w-full bg-black hover:bg-gray-900 text-white rounded-lg py-3 mt-2 font-medium">
                {editingAlbum ? "Update Album" : "Create Album"}
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-body text-sm">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-[hsl(215,15%,50%)]">Loading albums...</TableCell>
                </TableRow>
              ) : albums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-[hsl(215,15%,50%)]">No albums found. Create your first one!</TableCell>
                </TableRow>
              ) : (
                albums.map((album: any) => (
                  <TableRow key={album.id} className="hover:bg-[hsl(0,0%,99%)]">
                    <TableCell>
                      {album.cover_image_url ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden shadow-sm border border-[hsl(215,20%,90%)]">
                          <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-[hsl(215,20%,90%)]">
                          <ImageIcon className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-black">{album.title}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">{album.category}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider ${album.is_published ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-[hsl(215,15%,50%)]"}`}>
                        {album.is_published ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Link to={`/admin/albums/${album.id}/photos`}>
                          <Button variant="ghost" size="sm" className="text-[hsl(215,15%,50%)] hover:text-black">
                            <Images className="h-4 w-4 mr-2" />
                            Manage Photos
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(album)} className="text-[hsl(215,15%,50%)] hover:text-black rounded-lg">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this album?")) deleteMutation.mutate(album.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
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

export default Albums;
