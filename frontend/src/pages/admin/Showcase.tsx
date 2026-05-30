import { useState, useRef, useEffect } from "react";
import type { ShowcaseItem } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchShowcaseItems, createShowcaseItem, updateShowcaseItem, deleteShowcaseItem, uploadImage } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, UploadCloud, ImageIcon, Eye, EyeOff, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Local Sub-component to manage inline display order without losing input focus
const DisplayOrderInput = ({
  item,
  onUpdate,
}: {
  item: ShowcaseItem;
  onUpdate: (item: ShowcaseItem, newOrder: number) => void;
}) => {
  const [val, setVal] = useState(item.display_order || 0);

  // Sync state if backend updates
  useEffect(() => {
    setVal(item.display_order || 0);
  }, [item.display_order]);

  const handleBlur = () => {
    if (val !== item.display_order) {
      onUpdate(item, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <Input
      type="number"
      value={val}
      onChange={(e) => setVal(Number(e.target.value))}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-16 h-8 text-center border-[hsl(215,20%,90%)] rounded font-body"
    />
  );
};

const Showcase = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    image_url: "",
    display_order: 0,
    is_active: true,
  });
  const [isUploading, setIsUploading] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState<ShowcaseItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    image_url: "",
    display_order: 0,
    is_active: true,
  });
  const [editUploading, setEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch showcase items
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["admin_showcase_items"],
    queryFn: async () => {
      const res = await fetchShowcaseItems();
      return res.data || [];
    },
  });
  const items = Array.isArray(response) ? response : [];

  // Create showcase item mutation
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createShowcaseItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_showcase_items"] });
      toast.success("Showcase item created successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to create showcase item"),
  });

  // Edit mutation for complete update
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateShowcaseItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_showcase_items"] });
      toast.success("Showcase item updated successfully");
      setIsDialogOpen(false);
      resetEditForm();
    },
    onError: () => toast.error("Failed to update showcase item"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShowcaseItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_showcase_items"] });
      toast.success("Showcase item deleted successfully");
    },
    onError: () => toast.error("Failed to delete showcase item"),
  });

  // Toggle active status mutation - sends full resource representation to satisfy PUT constraints
  const toggleActiveMutation = useMutation({
    mutationFn: ({ item, is_active }: { item: ShowcaseItem; is_active: boolean }) =>
      updateShowcaseItem(item.id, {
        image_url: item.image_url,
        title: item.title,
        category: item.category,
        display_order: item.display_order || 0,
        is_active: is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_showcase_items"] });
      toast.success("Status updated successfully");
    },
    onError: () => toast.error("Failed to update status"),
  });

  // Update display order mutation - sends full resource representation to satisfy PUT constraints
  const updateOrderMutation = useMutation({
    mutationFn: ({ item, display_order }: { item: ShowcaseItem; display_order: number }) =>
      updateShowcaseItem(item.id, {
        image_url: item.image_url,
        title: item.title,
        category: item.category,
        display_order: display_order,
        is_active: item.is_active !== false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_showcase_items"] });
      toast.success("Display order updated");
    },
    onError: () => toast.error("Failed to update display order"),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: res.data.url }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error("Please upload an image first");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.category.trim()) {
      toast.error("Please enter a category");
      return;
    }

    const payload = {
      ...formData,
      display_order: Number(formData.display_order) || items.length,
    };
    
    createMutation.mutate(payload);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      image_url: "",
      display_order: 0,
      is_active: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditClick = (item: ShowcaseItem) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      category: item.category,
      image_url: item.image_url,
      display_order: item.display_order || 0,
      is_active: item.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const resetEditForm = () => {
    setEditingItem(null);
    setEditFormData({
      title: "",
      category: "",
      image_url: "",
      display_order: 0,
      is_active: true,
    });
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editFormData.image_url) {
      toast.error("Please upload an image first");
      return;
    }
    if (!editFormData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!editFormData.category.trim()) {
      toast.error("Please enter a category");
      return;
    }

    editMutation.mutate({
      id: editingItem.id,
      data: {
        title: editFormData.title,
        category: editFormData.category,
        image_url: editFormData.image_url,
        display_order: Number(editFormData.display_order),
        is_active: editFormData.is_active,
      },
    });
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    try {
      const res = await uploadImage(file);
      setEditFormData((prev) => ({ ...prev, image_url: res.data.url }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setEditUploading(false);
    }
  };

  const handleToggleActive = (item: ShowcaseItem, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ item, is_active: !currentStatus });
  };

  const handleUpdateOrder = (item: ShowcaseItem, newOrder: number) => {
    updateOrderMutation.mutate({ item, display_order: newOrder });
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Page Title & Stats */}
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Showcase Items</h1>
        <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">
          {items.length} items — "Stories We've Told" section
        </p>
      </div>

      {/* Errors Banner */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-body text-sm">
          Failed to load showcase items.
        </div>
      )}

      {/* Showcase Listing / Empty State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-sm p-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
          <p className="mt-4 text-sm font-body text-[hsl(215,15%,50%)]">Loading showcase items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-sm p-16 text-center max-w-full">
          <p className="font-display text-xl font-medium text-black mb-1">No showcase items yet.</p>
          <p className="font-body text-sm text-[hsl(215,15%,50%)]">
            Add items below to populate the "Stories We've Told" section.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-6 border-b border-[hsl(215,20%,90%)] bg-[hsl(0,0%,98%)]">
            <h3 className="font-display text-lg font-semibold text-black">Current Items</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[hsl(0,0%,98%)] hover:bg-[hsl(0,0%,98%)] font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                  <TableHead className="px-6 py-4 w-[120px]">Image</TableHead>
                  <TableHead className="px-6 py-4">Title</TableHead>
                  <TableHead className="px-6 py-4">Category</TableHead>
                  <TableHead className="px-6 py-4 w-[100px]">Order</TableHead>
                  <TableHead className="px-6 py-4 w-[120px]">Status</TableHead>
                  <TableHead className="px-6 py-4 text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body text-sm">
                {[...items]
                  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                  .map((item) => (
                    <TableRow key={item.id} className="hover:bg-[hsl(0,0%,99%)] transition-colors">
                      <TableCell className="px-6 py-4">
                        {item.image_url ? (
                          <div className="w-16 h-20 rounded-lg overflow-hidden border border-[hsl(215,20%,90%)] shadow-sm">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-20 rounded-lg bg-gray-50 flex items-center justify-center border border-[hsl(215,20%,90%)]">
                            <ImageIcon className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-black">{item.title}</TableCell>
                      <TableCell className="px-6 py-4 text-[hsl(215,15%,50%)]">{item.category}</TableCell>
                      <TableCell className="px-6 py-4">
                        <DisplayOrderInput item={item} onUpdate={handleUpdateOrder} />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(item, item.is_active !== false)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider ${
                            item.is_active !== false
                              ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                              : "bg-gray-50 border-gray-200 text-[hsl(215,15%,50%)] hover:bg-gray-100"
                          }`}
                        >
                          {item.is_active !== false ? (
                            <>
                              <Eye className="h-3.5 w-3.5" /> Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5" /> Hidden
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            className="text-[hsl(215,15%,50%)] hover:text-black rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this showcase item?")) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add New Item Form (Matching reference layout style) */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-black">Add New Item</h2>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Image Uploader Card (Using correct portrait ratio) */}
            <div className="md:col-span-4 flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                disabled={isUploading}
              />
              
              <div
                onClick={handleUploadContainerClick}
                className={`w-full aspect-[3/4] max-w-[220px] border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                  formData.image_url
                    ? "border-gray-200"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                    <span className="font-body text-xs text-[hsl(215,15%,50%)]">Uploading image...</span>
                  </div>
                ) : formData.image_url ? (
                  <>
                    <img
                      src={formData.image_url}
                      alt="Uploaded Preview"
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="font-body text-xs text-white bg-black/60 px-3 py-1.5 rounded-full">
                        Change Photo
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <UploadCloud className="h-10 w-10 text-gray-400 group-hover:text-gray-500 transition-colors" />
                    <div className="space-y-1">
                      <p className="font-body text-xs font-semibold text-black">
                        Click to choose or drag a photo here
                      </p>
                      <p className="font-body text-[10px] text-[hsl(215,15%,50%)]">
                        JPEG, PNG, WebP — max 20MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Inputs & Submit Button */}
            <div className="md:col-span-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. The First Look"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="border-[hsl(215,20%,90%)] rounded-lg py-5 px-4 focus-visible:ring-black font-body placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                  Category *
                </Label>
                <Input
                  id="category"
                  placeholder="e.g. Intimate Moments"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  required
                  className="border-[hsl(215,20%,90%)] rounded-lg py-5 px-4 focus-visible:ring-black font-body placeholder:text-gray-300"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked as boolean }))}
                  className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                />
                <Label htmlFor="is_active" className="cursor-pointer font-body text-xs font-semibold text-black">
                  Make item visible immediately on homepage
                </Label>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending || isUploading}
                className="w-full bg-black hover:bg-gray-900 text-white rounded-lg py-6 mt-2 font-medium font-body flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" /> Adding Item...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add Item
                  </>
                )}
              </Button>
            </div>
            
          </div>
        </form>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetEditForm(); }}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto font-body animate-in fade-in-50 duration-200">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Edit Showcase Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                Image
              </Label>
              <input
                type="file"
                ref={editFileInputRef}
                onChange={handleEditImageUpload}
                accept="image/*"
                className="hidden"
                disabled={editUploading}
              />
              <div
                onClick={() => editFileInputRef.current?.click()}
                className={`w-full aspect-[3/4] max-w-[150px] mx-auto border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                  editFormData.image_url
                    ? "border-gray-200"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {editUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Loader2 className="h-6 w-6 animate-spin text-black" />
                    <span className="text-[10px] text-[hsl(215,15%,50%)]">Uploading...</span>
                  </div>
                ) : editFormData.image_url ? (
                  <>
                    <img
                      src={editFormData.image_url}
                      alt="Edit Preview"
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-[10px] text-white bg-black/60 px-2.5 py-1 rounded-full">
                        Change
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="text-[10px] text-black font-semibold">Choose Photo</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                Title *
              </Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                Category *
              </Label>
              <Input
                id="edit-category"
                value={editFormData.category}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, category: e.target.value }))}
                required
                className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-display-order" className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                Display Order
              </Label>
              <Input
                id="edit-display-order"
                type="number"
                value={editFormData.display_order}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
                required
                className="border-[hsl(215,20%,90%)] rounded-lg focus-visible:ring-black"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="edit-is-active"
                checked={editFormData.is_active}
                onCheckedChange={(checked) => setEditFormData((prev) => ({ ...prev, is_active: checked as boolean }))}
                className="data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <Label htmlFor="edit-is-active" className="cursor-pointer text-sm font-semibold text-black">
                Visible on homepage
              </Label>
            </div>

            <Button
              type="submit"
              disabled={editMutation.isPending || editUploading}
              className="w-full bg-black hover:bg-gray-900 text-white rounded-lg py-3 mt-2 font-medium"
            >
              {editMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" /> Saving Changes...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Showcase;
