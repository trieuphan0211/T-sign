import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock } from "lucide-react";

interface WorkflowStep {
  id: string;
  user: { name: string; initials: string };
  role: string;
  status: "completed" | "current" | "pending";
  completedAt?: string;
}

interface Workflow {
  id: string;
  documentName: string;
  steps: WorkflowStep[];
}

const workflows: Workflow[] = [
  {
    id: "1",
    documentName: "Hợp đồng lao động #2024-001",
    steps: [
      {
        id: "1",
        user: { name: "Nguyễn Văn A", initials: "NA" },
        role: "Người tạo",
        status: "completed",
        completedAt: "14:30",
      },
      {
        id: "2",
        user: { name: "Trần Văn B", initials: "TB" },
        role: "Phê duyệt",
        status: "current",
      },
      {
        id: "3",
        user: { name: "Lê Thị C", initials: "LC" },
        role: "Ký chính",
        status: "pending",
      },
    ],
  },
  {
    id: "2",
    documentName: "Quyết định bổ nhiệm #456",
    steps: [
      {
        id: "1",
        user: { name: "Phạm D", initials: "PD" },
        role: "Người tạo",
        status: "completed",
        completedAt: "09:15",
      },
      {
        id: "2",
        user: { name: "Hoàng E", initials: "HE" },
        role: "Phê duyệt 1",
        status: "completed",
        completedAt: "10:42",
      },
      {
        id: "3",
        user: { name: "Vũ F", initials: "VF" },
        role: "Phê duyệt 2",
        status: "current",
      },
      {
        id: "4",
        user: { name: "Đặng G", initials: "DG" },
        role: "Ký chính",
        status: "pending",
      },
    ],
  },
];

export function WorkflowProgress() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border p-5">
        <h3 className="text-lg font-semibold">Luồng công việc đang chạy</h3>
        <p className="text-sm text-muted-foreground">
          Theo dõi tiến độ ký các tài liệu
        </p>
      </div>
      <div className="divide-y divide-border">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="p-5 space-y-4">
            <p className="font-medium text-sm">{workflow.documentName}</p>
            <div className="flex items-center gap-2">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      step.status === "completed" &&
                        "bg-success/10 text-success",
                      step.status === "current" &&
                        "bg-primary/10 text-primary ring-2 ring-primary/20",
                      step.status === "pending" &&
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarFallback
                        className={cn(
                          "text-[9px]",
                          step.status === "completed" &&
                            "bg-success text-success-foreground",
                          step.status === "current" &&
                            "bg-primary text-primary-foreground",
                          step.status === "pending" &&
                            "bg-muted-foreground/30 text-muted-foreground",
                        )}
                      >
                        {step.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">
                      {step.user.name.split(" ").pop()}
                    </span>
                    {step.status === "completed" && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {step.status === "current" && (
                      <Clock className="h-3 w-3 animate-pulse" />
                    )}
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-0.5 mx-1",
                        step.status === "completed"
                          ? "bg-success"
                          : "bg-border",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
