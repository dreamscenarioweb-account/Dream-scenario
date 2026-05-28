import { useState } from "react";
import type { Photo } from "@/types";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAlbumPhotos, addAlbumPhoto, deletePhoto } from "@/lib/adminApi";
import { fetchPublicAlbumBySlug } from "@/lib/adminApi"; // used to get album details though slug might differ, actually we just need album photos
// Wait, admin API doesn't have an endpoint to fetch a single album by ID. I'll just rely on the photos list.
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, ArrowLeft, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/adminApi";

const AlbumPhotos = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: photosResponse, isLoading } = useQuery({
    queryKey: ["admin_album_photos", id],
    queryFn: async () => {
      const res = await fetchAlbumPhotos(id!);
      return res.data || [];
    },
    enabled: !!id,
  });
  const photos = Array.isArray(photosResponse) ? photosResponse : [];

  const addPhotoMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => addAlbumPhoto(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_album_photos", id] });
      toast.success("Photo added to album");
    },
    onError: () => toast.error("Failed to add photo to album"),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => deletePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_album_photos", id] });
      toast.success("Photo removed");
    },
    onError: () => toast.error("Failed to remove photo"),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Upload to server
        const res = await uploadImage(file);
        
        // Add to album database
        await addPhotoMutation.mutateAsync({
          url: res.data.url,
          alt_text: "",
          display_order: photos.length + i,
        });
        
        successCount++;
      }
      toast.success(`Successfully uploaded ${successCount} photos`);
    } catch (err) {
      toast.error("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/albums" className="text-[hsl(215,15%,50%)] hover:text-black transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="font-display text-4xl font-bold tracking-tight text-black">Manage Photos</h1>
          </div>
          <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Add and arrange photos for this album.</p>
        </div>
        
        <div>
          <input
            type="file"
            id="photo-upload"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Label 
            htmlFor="photo-upload"
            className={`flex items-center justify-center font-body ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-900 cursor-pointer'} text-white rounded-full px-6 py-2.5 shadow-md transition-colors`}
          >
            {isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              <><UploadCloud className="mr-2 h-4 w-4" /> Upload Photos</>
            )}
          </Label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 mb-2">
              <UploadCloud className="h-6 w-6 text-gray-300" />
            </div>
            <h3 className="font-display text-xl text-black">No photos yet</h3>
            <p className="font-body text-sm text-[hsl(215,15%,50%)] max-w-sm">
              Click the upload button above to add some high-resolution photos to this album.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.sort((a, b) => a.display_order - b.display_order).map((photo: Photo) => (
              <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-sm border border-[hsl(215,20%,90%)] bg-gray-50">
                <img 
                  src={photo.url} 
                  alt={photo.alt_text || "Album photo"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100 flex items-start justify-end p-2">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg shadow-md"
                    onClick={() => {
                      if (confirm("Remove this photo from the album?")) {
                        deletePhotoMutation.mutate(photo.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {photo.is_featured && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded text-[9px] font-bold tracking-widest uppercase text-black">
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumPhotos;
