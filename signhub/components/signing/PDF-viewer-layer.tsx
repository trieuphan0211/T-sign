import { cn } from "@/lib/utils";
import { PDFPageDimensions } from "@/types/signature";
import { Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface PDFViewerLayerProps {
  pdfUrl?: string;
  currentPage: number;
  zoom: number;
  onPageChange?: (page: number) => void;
  onTotalPagesChange?: (total: number) => void;
  onDimensionsChange?: (dimensions: PDFPageDimensions) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PDFViewerLayer({
  pdfUrl,
  currentPage,
  zoom,
  onTotalPagesChange,
  onDimensionsChange,
  className,
  children,
}: PDFViewerLayerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scale = zoom / 100;

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
      setError(null);
      onTotalPagesChange?.(numPages);
    },
    [onTotalPagesChange],
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("PDF load error:", error);
    setError("Không thể tải tài liệu PDF");
    setIsLoading(false);
  }, []);

  const onPageLoadSuccess = useCallback(
    (page: { originalWidth: number; originalHeight: number }) => {
      const originalWidth = page.originalWidth;
      const originalHeight = page.originalHeight;
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;

      onDimensionsChange?.({
        originalWidth,
        originalHeight,
        scaledWidth,
        scaledHeight,
        scale,
      });
    },
    [scale, onDimensionsChange],
  );

  // Demo PDF URL (using a sample PDF)
  const demoPdfUrl = pdfUrl || "/sample.pdf";

  // If no PDF URL provided, show placeholder
  if (!pdfUrl) {
    const pageWidth = 595 * scale;
    const pageHeight = 842 * scale;

    return (
      <div className={cn("inline-block", className)}>
        <div
          ref={containerRef}
          className="bg-card shadow-elevation-2 rounded-lg relative"
          style={{
            width: pageWidth,
            height: pageHeight,
          }}
        >
          {/* Placeholder document content */}
          <div
            className="p-8 space-y-6"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">HỢP ĐỒNG LAO ĐỘNG</h2>
              <p className="text-sm text-muted-foreground">Số: 2024-001/HĐLĐ</p>
            </div>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                Hôm nay, ngày 15 tháng 12 năm 2024, tại trụ sở Công ty ABC,
                chúng tôi gồm:
              </p>
              <div className="pl-4 space-y-2">
                <p>
                  <strong>BÊN A (Người sử dụng lao động):</strong>
                </p>
                <p>Công ty TNHH ABC</p>
                <p>Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                <p>Đại diện: Ông Nguyễn Văn A - Giám đốc</p>
              </div>
              <div className="pl-4 space-y-2">
                <p>
                  <strong>BÊN B (Người lao động):</strong>
                </p>
                <p>Họ và tên: Trần Văn B</p>
                <p>Ngày sinh: 01/01/1990</p>
                <p>CCCD: 079090001234</p>
              </div>
              <div className="space-y-2 mt-6">
                <p>
                  <strong>ĐIỀU 1: CÔNG VIỆC VÀ ĐỊA ĐIỂM LÀM VIỆC</strong>
                </p>
                <p>1.1. Loại hợp đồng: Không xác định thời hạn</p>
                <p>1.2. Chức danh: Nhân viên kỹ thuật</p>
                <p>1.3. Địa điểm làm việc: 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
              </div>
              <div className="space-y-2 mt-6">
                <p>
                  <strong>ĐIỀU 2: LƯƠNG VÀ PHỤ CẤP</strong>
                </p>
                <p>2.1. Mức lương cơ bản: 15.000.000 VNĐ/tháng</p>
                <p>2.2. Phụ cấp: Theo quy định công ty</p>
              </div>
            </div>
          </div>
          {/* Interactive overlay for signatures */}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("inline-block", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <Document
        file={demoPdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
      >
        <div ref={containerRef} className="relative inline-block">
          <Page
            pageNumber={currentPage}
            scale={scale}
            onLoadSuccess={onPageLoadSuccess}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-elevation-2 rounded-lg"
          />
          {/* Interactive overlay for signatures */}
          {children}
        </div>
      </Document>
    </div>
  );
}
