import { useCallback, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PDFUploaderProps {
  onFileSelect: (file: File, url: string) => void;
  currentFile?: { name: string; url: string } | null;
  onClear?: () => void;
  className?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function PDFUploader({
  onFileSelect,
  currentFile,
  onClear,
  className,
}: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error("Chỉ hỗ trợ file PDF");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File vượt quá 20MB");
        return;
      }

      setIsProcessing(true);

      try {
        // Create object URL for the PDF
        const url = URL.createObjectURL(file);
        onFileSelect(file, url);
        toast.success(`Đã tải lên: ${file.name}`);
      } catch (error) {
        console.error("Error processing PDF:", error);
        toast.error("Lỗi xử lý file PDF");
      } finally {
        setIsProcessing(false);
      }
    },
    [onFileSelect],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      // Reset input
      e.target.value = "";
    },
    [processFile],
  );

  const handleClear = useCallback(() => {
    if (currentFile?.url) {
      URL.revokeObjectURL(currentFile.url);
    }
    onClear?.();
  }, [currentFile, onClear]);

  // Show current file
  if (currentFile) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50",
          className,
        )}
      >
        <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{currentFile.name}</p>
          <p className="text-xs text-muted-foreground">PDF Document</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 transition-all",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50",
        isProcessing && "pointer-events-none opacity-50",
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        disabled={isProcessing}
      />

      <div className="flex flex-col items-center justify-center gap-3 text-center">
        {isProcessing ? (
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
        )}
        <div>
          <p className="font-medium text-sm">
            {isProcessing ? "Đang xử lý..." : "Kéo thả PDF hoặc click để chọn"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Hỗ trợ PDF, tối đa 20MB
          </p>
        </div>
      </div>
    </div>
  );
}
