import { FileText, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export interface PDFDocument {
  id: string;
  name: string;
  url: string;
}

interface MultiFileTabsProps {
  files: PDFDocument[];
  activeFileId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddMore: () => void;
  className?: string;
}

export function MultiFileTabs({
  files,
  activeFileId,
  onSelect,
  onRemove,
  onAddMore,
  className,
}: MultiFileTabsProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={cn("border-b border-border bg-card", className)}>
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1 p-2">
          {files.map((file, index) => (
            <div
              key={file.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all min-w-0 max-w-[200px]",
                activeFileId === file.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-foreground",
              )}
              onClick={() => onSelect(file.id)}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium truncate">
                {index + 1}. {file.name}
              </span>
              <button
                className={cn(
                  "shrink-0 rounded-full p-0.5 transition-colors",
                  activeFileId === file.id
                    ? "hover:bg-primary-foreground/20"
                    : "hover:bg-destructive/20 opacity-0 group-hover:opacity-100",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(file.id);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1"
            onClick={onAddMore}
          >
            <Plus className="h-4 w-4" />
            Thêm file
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
