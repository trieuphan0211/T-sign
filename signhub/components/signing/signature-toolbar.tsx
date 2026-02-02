import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { PenTool, Stamp, Calendar, User, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignatureElementType } from "@/types/signature";

interface ToolbarItemProps {
  id: SignatureElementType;
  icon: typeof PenTool;
  label: string;
}

function DraggableToolItem({ id, icon: Icon, label }: ToolbarItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `toolbar-${id}`,
      data: { type: "toolbar-item", toolType: id },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 1000,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-grab active:cursor-grabbing transition-all select-none",
        "hover:border-primary hover:bg-primary/5",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary",
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

const toolbarItems: ToolbarItemProps[] = [
  { id: "VISUAL_SIGNATURE", icon: PenTool, label: "Chữ ký của tôi" },
  { id: "STAMP", icon: Stamp, label: "Con dấu" },
  { id: "DATE", icon: Calendar, label: "Ngày tháng" },
  { id: "NAME", icon: User, label: "Họ tên" },
];

interface SignatureToolbarProps {
  className?: string;
}

export function SignatureToolbar({ className }: SignatureToolbarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Kéo thả để đặt vị trí
      </h3>
      <div className="space-y-2">
        {toolbarItems.map((item) => (
          <DraggableToolItem key={item.id} {...item} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        Kéo công cụ và thả vào vị trí mong muốn trên tài liệu PDF
      </p>
    </div>
  );
}
