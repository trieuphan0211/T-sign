import { useState, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  PenTool,
  Stamp,
  Calendar,
  User,
  X,
  Move,
  GripHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignatureElement, SignatureElementType } from "@/types/signature";

interface SignatureBoxProps {
  element: SignatureElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onResize: (id: string, width: number, height: number) => void;
}

const typeIcons: Record<SignatureElementType, typeof PenTool> = {
  VISUAL_SIGNATURE: PenTool,
  STAMP: Stamp,
  DATE: Calendar,
  NAME: User,
  TEXT: User,
};

const typeLabels: Record<SignatureElementType, string> = {
  VISUAL_SIGNATURE: "Chữ ký",
  STAMP: "Con dấu",
  DATE: "Ngày tháng",
  NAME: "Họ tên",
  TEXT: "Văn bản",
};

export function SignatureBox({
  element,
  isSelected,
  onSelect,
  onDelete,
  onResize,
}: SignatureBoxProps) {
  const [isResizing, setIsResizing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const startSize = useRef({ width: element.width, height: element.height });
  const startPos = useRef({ x: 0, y: 0 });

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: element.id,
      data: { type: "signature-box", element },
      disabled: isResizing,
    });

  const Icon = typeIcons[element.type];

  const style = {
    transform: CSS.Translate.toString(transform),
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    startSize.current = { width: element.width, height: element.height };
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      const newWidth = Math.max(80, startSize.current.width + deltaX);
      const newHeight = Math.max(40, startSize.current.height + deltaY);
      onResize(element.id, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, element.id, onResize]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute flex items-center justify-center border-2 border-dashed rounded-lg transition-colors cursor-move select-none",
        isSelected
          ? "border-primary bg-primary/20 ring-2 ring-primary/30"
          : "border-primary/60 bg-primary/10 hover:border-primary hover:bg-primary/15",
        isDragging && "opacity-50 z-50",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      {...attributes}
      {...listeners}
    >
      {/* Content */}
      <div className="flex flex-col items-center text-primary pointer-events-none">
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium mt-1">
          {typeLabels[element.type]}
        </span>
      </div>

      {/* Move indicator */}
      <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
        <Move className="h-3 w-3" />
      </div>

      {/* Delete button */}
      {isSelected && (
        <button
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Resize handle */}
      {isSelected && (
        <div
          className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm cursor-se-resize hover:bg-primary/90 transition-colors"
          onMouseDown={handleResizeStart}
        >
          <GripHorizontal className="h-3 w-3 -rotate-45" />
        </div>
      )}
    </div>
  );
}
