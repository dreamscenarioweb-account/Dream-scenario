import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/adminApi";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

const ImageUpload = ({ value, onChange, className = "" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const res = await uploadImage(file);
      onChange(res.data.url || res.data.image_url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative group">
          <img src={value} alt="" className="w-full h-40 object-cover rounded border border-[hsl(215,20%,90%)]" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow hover:bg-red-50 transition-colors"
          >
            <X size={14} className="text-red-500" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 border-2 border-dashed border-[hsl(215,20%,88%)] rounded flex flex-col items-center justify-center gap-2 text-[hsl(215,15%,50%)] hover:border-[hsl(210,70%,60%)] hover:text-[hsl(210,70%,60%)] transition-colors"
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <Upload size={24} />
              <span className="font-body text-xs">Click to upload</span>
            </>
          )}
        </button>
      )}
      {error && <p className="font-body text-xs text-red-500 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
};

export default ImageUpload;
