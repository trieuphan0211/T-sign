import { Upload, PenTool, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actions = [
  {
    title: "Tải tài liệu",
    description: "Upload file PDF, DOCX để ký",
    icon: Upload,
    variant: "default" as const,
    href: "/documents/upload",
  },
  {
    title: "Ký tài liệu",
    description: "Vào phòng ký để ký số",
    icon: PenTool,
    variant: "primary" as const,
    href: "/signing-room",
  },
  {
    title: "Xác minh chữ ký",
    description: "Kiểm tra tính hợp lệ",
    icon: CheckCircle,
    variant: "default" as const,
    href: "/verify",
  },
  {
    title: "Mời người ký",
    description: "Gửi yêu cầu ký đến người khác",
    icon: Users,
    variant: "default" as const,
    href: "/workflows/create",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.title}
            variant="outline"
            className={cn(
              "h-auto flex-col items-start gap-3 p-5 text-left hover:shadow-elevation-2 transition-all",
              action.variant === "primary" &&
                "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground",
            )}
          >
            <div
              className={cn(
                "rounded-lg p-2.5",
                action.variant === "primary"
                  ? "bg-primary-foreground/20"
                  : "bg-primary/10",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  action.variant === "primary"
                    ? "text-primary-foreground"
                    : "text-primary",
                )}
              />
            </div>
            <div>
              <p className="font-semibold">{action.title}</p>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  action.variant === "primary"
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
                )}
              >
                {action.description}
              </p>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
