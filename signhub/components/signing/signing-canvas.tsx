import { useState, useCallback, useMemo, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { PenTool, Stamp, Calendar, User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PDFViewerLayer } from "./PDF-viewer-layer";
import { SignatureToolbar } from "./signature-toolbar";
import { SignatureBox } from "./signature-box";
import {
  SignatureElement,
  SignatureElementType,
  PDFPageDimensions,
  SignaturePositionOutput,
  convertToRelativePosition,
} from "@/types/signature";

interface SigningCanvasProps {
  pdfUrl?: string;
  currentPage: number;
  zoom: number;
  onTotalPagesChange?: (total: number) => void;
  onSavePositions?: (positions: SignaturePositionOutput[]) => void;
  className?: string;
}

const defaultSizes: Record<
  SignatureElementType,
  { width: number; height: number }
> = {
  VISUAL_SIGNATURE: { width: 150, height: 60 },
  STAMP: { width: 100, height: 100 },
  DATE: { width: 120, height: 30 },
  NAME: { width: 150, height: 30 },
  TEXT: { width: 200, height: 40 },
};

const typeIcons: Record<SignatureElementType, typeof PenTool> = {
  VISUAL_SIGNATURE: PenTool,
  STAMP: Stamp,
  DATE: Calendar,
  NAME: User,
  TEXT: User,
};

// Droppable PDF Container component
function DroppablePDFArea({
  children,
  dimensions,
}: {
  children: React.ReactNode;
  dimensions: PDFPageDimensions;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "pdf-drop-area",
  });

  return (
    <div
      ref={setNodeRef}
      data-pdf-container
      className={cn(
        "absolute inset-0 transition-colors",
        isOver && "bg-primary/10 ring-2 ring-primary/30 ring-inset",
      )}
      style={{
        width: dimensions.scaledWidth,
        height: dimensions.scaledHeight,
      }}
    >
      {children}
    </div>
  );
}

export function SigningCanvas({
  pdfUrl,
  currentPage,
  zoom,
  onTotalPagesChange,
  onSavePositions,
  className,
}: SigningCanvasProps) {
  const [signatures, setSignatures] = useState<SignatureElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeToolType, setActiveToolType] =
    useState<SignatureElementType | null>(null);
  const [pageDimensions, setPageDimensions] = useState<PDFPageDimensions>({
    originalWidth: 595,
    originalHeight: 842,
    scaledWidth: 595,
    scaledHeight: 842,
    scale: 1,
  });
  const [dragPosition, setDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );

  // Filter signatures for current page
  const currentPageSignatures = useMemo(
    () => signatures.filter((sig) => sig.pageNumber === currentPage),
    [signatures, currentPage],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === "toolbar-item") {
      setActiveToolType(data.toolType as SignatureElementType);
    }
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    // Track drag position for visual feedback
    const { active, delta } = event;
    if (active.data.current?.type === "toolbar-item") {
      setDragPosition({ x: delta.x, y: delta.y });
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;
      const data = active.data.current;

      setActiveToolType(null);
      setDragPosition(null);

      // Handle dropping new element from toolbar onto PDF area
      if (data?.type === "toolbar-item" && over?.id === "pdf-drop-area") {
        const toolType = data.toolType as SignatureElementType;

        // Get the PDF container element
        const containerElement = pdfContainerRef.current?.querySelector(
          "[data-pdf-container]",
        );
        if (!containerElement) {
          // Fallback: use the wrapper
          const wrapper = pdfContainerRef.current;
          if (!wrapper) return;

          const wrapperRect = wrapper.getBoundingClientRect();
          const size = defaultSizes[toolType];

          // Calculate drop position
          let x = pageDimensions.scaledWidth / 2 - size.width / 2;
          let y = pageDimensions.scaledHeight / 2 - size.height / 2;

          // If we have mouse event data, use it for more precise positioning
          if (event.activatorEvent instanceof PointerEvent) {
            const pointerX = event.activatorEvent.clientX + delta.x;
            const pointerY = event.activatorEvent.clientY + delta.y;

            x = pointerX - wrapperRect.left - size.width / 2;
            y = pointerY - wrapperRect.top - size.height / 2;
          }

          const newSignature: SignatureElement = {
            id: crypto.randomUUID(),
            pageNumber: currentPage,
            x: Math.max(
              0,
              Math.min(x, pageDimensions.scaledWidth - size.width),
            ),
            y: Math.max(
              0,
              Math.min(y, pageDimensions.scaledHeight - size.height),
            ),
            width: size.width,
            height: size.height,
            type: toolType,
          };

          setSignatures((prev) => [...prev, newSignature]);
          setSelectedId(newSignature.id);
          toast.success("Đã thêm trường ký vào vị trí");
          return;
        }

        const containerRect = containerElement.getBoundingClientRect();
        const size = defaultSizes[toolType];

        // Calculate drop position relative to PDF container
        let x = containerRect.width / 2 - size.width / 2;
        let y = containerRect.height / 2 - size.height / 2;

        if (event.activatorEvent instanceof PointerEvent) {
          const pointerX = event.activatorEvent.clientX + delta.x;
          const pointerY = event.activatorEvent.clientY + delta.y;

          x = pointerX - containerRect.left - size.width / 2;
          y = pointerY - containerRect.top - size.height / 2;
        }

        const newSignature: SignatureElement = {
          id: crypto.randomUUID(),
          pageNumber: currentPage,
          x: Math.max(0, Math.min(x, pageDimensions.scaledWidth - size.width)),
          y: Math.max(
            0,
            Math.min(y, pageDimensions.scaledHeight - size.height),
          ),
          width: size.width,
          height: size.height,
          type: toolType,
        };

        setSignatures((prev) => [...prev, newSignature]);
        setSelectedId(newSignature.id);
        toast.success("Đã thêm trường ký vào vị trí");
        return;
      }

      // Handle moving existing signature
      if (data?.type === "signature-box") {
        const element = data.element as SignatureElement;
        setSignatures((prev) =>
          prev.map((sig) =>
            sig.id === element.id
              ? {
                  ...sig,
                  x: Math.max(
                    0,
                    Math.min(
                      sig.x + delta.x,
                      pageDimensions.scaledWidth - sig.width,
                    ),
                  ),
                  y: Math.max(
                    0,
                    Math.min(
                      sig.y + delta.y,
                      pageDimensions.scaledHeight - sig.height,
                    ),
                  ),
                }
              : sig,
          ),
        );
      }
    },
    [currentPage, pageDimensions],
  );

  const handleResize = useCallback(
    (id: string, width: number, height: number) => {
      setSignatures((prev) =>
        prev.map((sig) => (sig.id === id ? { ...sig, width, height } : sig)),
      );
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    setSignatures((prev) => prev.filter((sig) => sig.id !== id));
    setSelectedId(null);
    toast.success("Đã xóa trường ký");
  }, []);

  const handleSavePositions = useCallback(() => {
    const positions: SignaturePositionOutput[] = signatures.map((sig) =>
      convertToRelativePosition(sig, pageDimensions),
    );

    console.log(
      "Signature positions for Backend:",
      JSON.stringify(positions, null, 2),
    );

    onSavePositions?.(positions);
    toast.success(`Đã lưu ${positions.length} vị trí chữ ký`);
  }, [signatures, pageDimensions, onSavePositions]);

  const handleDimensionsChange = useCallback(
    (dimensions: PDFPageDimensions) => {
      setPageDimensions(dimensions);
    },
    [],
  );

  const DragOverlayContent = activeToolType ? (
    <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-primary bg-primary/20 shadow-lg pointer-events-none">
      {(() => {
        const Icon = typeIcons[activeToolType];
        return <Icon className="h-5 w-5 text-primary" />;
      })()}
      <span className="text-sm font-medium text-primary">
        {activeToolType === "VISUAL_SIGNATURE" && "Chữ ký"}
        {activeToolType === "STAMP" && "Con dấu"}
        {activeToolType === "DATE" && "Ngày tháng"}
        {activeToolType === "NAME" && "Họ tên"}
      </span>
    </div>
  ) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex gap-4", className)}>
        {/* PDF Viewer with Overlay */}
        <div
          ref={pdfContainerRef}
          className="flex-1 overflow-auto p-8 bg-muted/30 rounded-xl flex justify-center"
          onClick={() => setSelectedId(null)}
        >
          <PDFViewerLayer
            pdfUrl={pdfUrl}
            currentPage={currentPage}
            zoom={zoom}
            onTotalPagesChange={onTotalPagesChange}
            onDimensionsChange={handleDimensionsChange}
          >
            {/* Droppable Signature Overlay Layer */}
            <DroppablePDFArea dimensions={pageDimensions}>
              <div className="pointer-events-auto w-full h-full">
                {currentPageSignatures.map((element) => (
                  <SignatureBox
                    key={element.id}
                    element={element}
                    isSelected={selectedId === element.id}
                    onSelect={() => setSelectedId(element.id)}
                    onDelete={() => handleDelete(element.id)}
                    onResize={handleResize}
                  />
                ))}
              </div>
            </DroppablePDFArea>
          </PDFViewerLayer>
        </div>

        {/* Right Toolbar */}
        <div className="w-64 shrink-0 rounded-xl border border-border bg-card p-4 space-y-4">
          <SignatureToolbar />

          {/* Placed signatures list */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-3">
              Trường ký đã đặt ({signatures.length})
            </h3>
            {signatures.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Kéo thả công cụ vào tài liệu để đặt vị trí ký
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {signatures.map((sig, index) => {
                  const Icon = typeIcons[sig.type];
                  return (
                    <div
                      key={sig.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg text-sm cursor-pointer transition-colors",
                        selectedId === sig.id
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/50 hover:bg-muted",
                      )}
                      onClick={() => setSelectedId(sig.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>Trang {sig.pageNumber}</span>
                      </div>
                      <button
                        className="text-destructive hover:text-destructive/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sig.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save button */}
          <Button
            className="w-full gap-2"
            onClick={handleSavePositions}
            disabled={signatures.length === 0}
          >
            <Save className="h-4 w-4" />
            Lưu vị trí ({signatures.length})
          </Button>
        </div>
      </div>

      {/* Drag overlay - positioned at cursor */}
      <DragOverlay dropAnimation={null} modifiers={[]}>
        {DragOverlayContent}
      </DragOverlay>
    </DndContext>
  );
}
