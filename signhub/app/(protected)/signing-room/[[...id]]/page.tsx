"use client";
import { useState, useCallback, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  PenTool,
  FileStack,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SignaturePositionOutput } from "@/types/signature";
import { toast } from "sonner";
import { PDFUploader } from "@/components/signing/PDF-uploader";
import {
  MultiFileTabs,
  PDFDocument,
} from "@/components/signing/multi-file-tabs";
import { SigningCanvas } from "@/components/signing/signing-canvas";
import { RemoteSigningFlow } from "@/components/signing/remote-signing-flow";
import { BulkSigningPanel } from "@/components/signing/bulk-signing-panel";

interface FileSignatures {
  [fileId: string]: SignaturePositionOutput[];
}

export default function SigningRoom() {
  const [files, setFiles] = useState<PDFDocument[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [pageState, setPageState] = useState<{
    [fileId: string]: { current: number; total: number };
  }>({});
  const [zoom, setZoom] = useState(100);
  const [showRemoteSigning, setShowRemoteSigning] = useState(false);
  const [showBulkSigning, setShowBulkSigning] = useState(false);
  const [fileSignatures, setFileSignatures] = useState<FileSignatures>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || null;
  const currentPageInfo = activeFileId ? pageState[activeFileId] : null;
  const currentPage = currentPageInfo?.current || 1;
  const totalPages = currentPageInfo?.total || 1;

  const handleZoomIn = () => setZoom((prev) => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 25));

  const handleFileSelect = useCallback((file: File, url: string) => {
    const newFile: PDFDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      url,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setPageState((prev) => ({
      ...prev,
      [newFile.id]: { current: 1, total: 1 },
    }));
  }, []);

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === fileId);
        if (file?.url) {
          URL.revokeObjectURL(file.url);
        }
        const newFiles = prev.filter((f) => f.id !== fileId);

        // Update active file if removed
        if (activeFileId === fileId) {
          setActiveFileId(newFiles.length > 0 ? newFiles[0].id : null);
        }

        return newFiles;
      });

      // Clean up page state and signatures
      setPageState((prev) => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
      setFileSignatures((prev) => {
        const newSigs = { ...prev };
        delete newSigs[fileId];
        return newSigs;
      });
    },
    [activeFileId],
  );

  const handleAddMore = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList) {
        Array.from(fileList).forEach((file) => {
          if (file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            handleFileSelect(file, url);
          } else {
            toast.error(`${file.name} không phải file PDF`);
          }
        });
      }
      e.target.value = "";
    },
    [handleFileSelect],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (!activeFileId) return;
      setPageState((prev) => ({
        ...prev,
        [activeFileId]: { ...prev[activeFileId], current: page },
      }));
    },
    [activeFileId],
  );

  const handleTotalPagesChange = useCallback(
    (total: number) => {
      if (!activeFileId) return;
      setPageState((prev) => ({
        ...prev,
        [activeFileId]: { ...prev[activeFileId], total },
      }));
    },
    [activeFileId],
  );

  const handleSavePositions = useCallback(
    (positions: SignaturePositionOutput[]) => {
      if (!activeFileId) return;

      setFileSignatures((prev) => ({
        ...prev,
        [activeFileId]: positions,
      }));

      console.log(`=== SIGNATURES FOR FILE ${activeFileId} ===`);
      console.log(JSON.stringify(positions, null, 2));
      toast.success("Đã lưu vị trí chữ ký!");
    },
    [activeFileId],
  );

  const handleSignAll = useCallback(() => {
    const allSignatures = Object.entries(fileSignatures).map(
      ([fileId, positions]) => {
        const file = files.find((f) => f.id === fileId);
        return {
          fileId,
          fileName: file?.name || "Unknown",
          positions,
        };
      },
    );

    console.log("=== ALL SIGNATURES FOR BACKEND ===");
    console.log(JSON.stringify(allSignatures, null, 2));
    toast.success(`Đã ký ${files.length} tài liệu thành công!`);
  }, [files, fileSignatures]);

  const handleRemoteSignComplete = (data: {
    certificateId: string;
    signatureImage: string;
    verificationMethod: "email" | "otp";
    signingReason?: string;
    location?: string;
  }) => {
    console.log("Remote signing completed:", data);
    toast.success("Ký số từ xa thành công!");
  };

  const handleBulkSignComplete = (signedDocIds: string[]) => {
    console.log("Bulk signing completed:", signedDocIds);
    toast.success(`Đã ký ${signedDocIds.length} tài liệu!`);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-in">
      {/* Hidden file input for adding more files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-lg font-semibold">
              {files.length > 0
                ? `Ký ${files.length} tài liệu`
                : "Chưa chọn tài liệu"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeFile
                ? `Đang xem: ${activeFile.name}`
                : "Vui lòng upload file PDF để bắt đầu"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
            Từ chối
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowBulkSigning(true)}
          >
            <FileStack className="h-4 w-4" />
            Ký lô
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowRemoteSigning(true)}
          >
            <PenTool className="h-4 w-4" />
            Ký từ xa
          </Button>
          <Button
            className="gap-2 bg-success hover:bg-success/90"
            onClick={handleSignAll}
            disabled={files.length === 0}
          >
            <Check className="h-4 w-4" />
            Ký & Hoàn tất ({files.length})
          </Button>
        </div>
      </div>

      {/* Multi-file tabs */}
      {files.length > 0 && (
        <MultiFileTabs
          files={files}
          activeFileId={activeFileId}
          onSelect={setActiveFileId}
          onRemove={handleRemoveFile}
          onAddMore={handleAddMore}
        />
      )}

      <div className="flex-1 flex gap-4 min-h-0 mt-4">
        {/* Left Panel - Certificate Selection & PDF Upload */}
        <div className="w-64 shrink-0 rounded-xl border border-border bg-card p-4 space-y-4 overflow-y-auto">
          {/* PDF Upload Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Tài liệu PDF ({files.length})
            </h3>
            <PDFUploader
              onFileSelect={handleFileSelect}
              currentFile={null}
              className="mb-2"
            />
            {files.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Có thể thêm nhiều file
              </p>
            )}
          </div>

          <Separator />

          {/* Certificate Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Chứng thư số</h3>
            <Select defaultValue="cert1">
              <SelectTrigger>
                <SelectValue placeholder="Chọn chứng thư" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cert1">
                  <div className="flex flex-col">
                    <span>Chứng thư cá nhân</span>
                    <span className="text-xs text-muted-foreground">
                      VNPT-CA
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="cert2">
                  <div className="flex flex-col">
                    <span>Chứng thư tổ chức</span>
                    <span className="text-xs text-muted-foreground">
                      VIETTEL-CA
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Page Thumbnails */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Trang tài liệu</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={cn(
                    "w-full aspect-[3/4] rounded-lg border-2 bg-muted/50 flex items-center justify-center text-xs font-medium transition-all",
                    currentPage === i + 1
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-muted-foreground/30",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Signing Canvas */}
        <div className="flex-1 rounded-xl border border-border bg-muted/30 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">
                {zoom}%
              </span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button variant="ghost" size="icon">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Signing Canvas */}
          <div className="flex-1 overflow-hidden">
            <SigningCanvas
              key={activeFileId || "empty"}
              pdfUrl={activeFile?.url}
              currentPage={currentPage}
              zoom={zoom}
              onTotalPagesChange={handleTotalPagesChange}
              onSavePositions={handleSavePositions}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Remote Signing Flow Dialog */}
      <RemoteSigningFlow
        open={showRemoteSigning}
        onOpenChange={setShowRemoteSigning}
        onComplete={handleRemoteSignComplete}
        documentName={activeFile?.name || "Tài liệu"}
        requireReason={true}
        requireLocation={true}
      />

      {/* Bulk Signing Panel */}
      <BulkSigningPanel
        open={showBulkSigning}
        onOpenChange={setShowBulkSigning}
        onComplete={handleBulkSignComplete}
      />
    </div>
  );
}
