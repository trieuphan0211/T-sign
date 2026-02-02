import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: string;
  status: "pending" | "signed" | "rejected" | "expired";
  updatedAt: string;
  signer?: string;
}

const documents: Document[] = [
  {
    id: "1",
    name: "Hợp đồng lao động #2024-001",
    type: "PDF",
    status: "pending",
    updatedAt: "5 phút trước",
    signer: "Trần Văn B",
  },
  {
    id: "2",
    name: "Biên bản họp HĐQT Q4-2024",
    type: "PDF",
    status: "signed",
    updatedAt: "1 giờ trước",
  },
  {
    id: "3",
    name: "Báo cáo tài chính năm 2024",
    type: "DOCX",
    status: "pending",
    updatedAt: "2 giờ trước",
    signer: "Nguyễn Thị C",
  },
  {
    id: "4",
    name: "Quyết định bổ nhiệm #123",
    type: "PDF",
    status: "rejected",
    updatedAt: "3 giờ trước",
  },
  {
    id: "5",
    name: "Hợp đồng thuê mặt bằng",
    type: "PDF",
    status: "expired",
    updatedAt: "1 ngày trước",
  },
];

const statusConfig = {
  pending: {
    label: "Chờ ký",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  signed: {
    label: "Đã ký",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/20",
  },
  rejected: {
    label: "Từ chối",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expired: {
    label: "Hết hạn",
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground border-muted",
  },
};

export function RecentDocuments() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-lg font-semibold">Tài liệu gần đây</h3>
          <p className="text-sm text-muted-foreground">
            Các tài liệu được cập nhật gần nhất
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          Xem tất cả
        </Button>
      </div>
      <div className="divide-y divide-border">
        {documents.map((doc) => {
          const status = statusConfig[doc.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.updatedAt}</span>
                  {doc.signer && (
                    <>
                      <span>•</span>
                      <span>Chờ: {doc.signer}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn("gap-1 font-medium", status.className)}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
