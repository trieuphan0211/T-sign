import { useState, useCallback } from "react";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/xml",
  "application/xml",
];

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "xml"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface DocumentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (files: File[]) => void;
}

export function DocumentUpload({
  open,
  onOpenChange,
  onUploadComplete,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return `Định dạng không hỗ trợ. Chỉ chấp nhận: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File quá lớn. Kích thước tối đa: 20MB`;
    }

    return null;
  };

  const simulateUpload = (uploadFile: UploadFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, progress: 100, status: "success" }
              : f,
          ),
        );
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, progress: Math.round(progress) }
              : f,
          ),
        );
      }
    }, 200);
  };

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadFile[] = [];

    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      const uploadFile: UploadFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: error ? 0 : 0,
        status: error ? "error" : "uploading",
        error: error || undefined,
      };
      newFiles.push(uploadFile);

      if (!error) {
        setTimeout(() => simulateUpload(uploadFile), 100);
      }
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles],
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleComplete = () => {
    const successFiles = files
      .filter((f) => f.status === "success")
      .map((f) => f.file);
    onUploadComplete?.(successFiles);
    setFiles([]);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const successCount = files.filter((f) => f.status === "success").length;
  const isUploading = files.some((f) => f.status === "uploading");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tải tài liệu lên</DialogTitle>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
          )}
        >
          <input
            type="file"
            multiple
            accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted",
              )}
            >
              <Upload
                className={cn(
                  "h-7 w-7 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>
            <div>
              <p className="font-medium">
                {isDragging
                  ? "Thả file tại đây"
                  : "Kéo thả file hoặc click để chọn"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, DOCX, XLSX, XML - Tối đa 20MB
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3 max-h-[240px] overflow-y-auto">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  uploadFile.status === "error"
                    ? "bg-destructive/5 border-destructive/20"
                    : uploadFile.status === "success"
                      ? "bg-success/5 border-success/20"
                      : "bg-muted/50 border-border",
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                    uploadFile.status === "error"
                      ? "bg-destructive/10"
                      : uploadFile.status === "success"
                        ? "bg-success/10"
                        : "bg-primary/10",
                  )}
                >
                  {uploadFile.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : uploadFile.status === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  {uploadFile.status === "error" ? (
                    <p className="text-xs text-destructive">
                      {uploadFile.error}
                    </p>
                  ) : uploadFile.status === "uploading" ? (
                    <div className="mt-1.5">
                      <Progress value={uploadFile.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {uploadFile.progress}%
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeFile(uploadFile.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {successCount} / {files.length} file đã tải lên
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  onOpenChange(false);
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isUploading || successCount === 0}
              >
                {isUploading ? "Đang tải..." : "Hoàn tất"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
