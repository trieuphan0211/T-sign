import { Key, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  serial: string;
  expiresIn: number; // days
  status: "valid" | "expiring" | "expired";
}

const certificates: Certificate[] = [
  {
    id: "1",
    name: "Chứng thư số cá nhân",
    issuer: "VNPT-CA",
    serial: "0123456789ABCDEF",
    expiresIn: 245,
    status: "valid",
  },
  {
    id: "2",
    name: "Chứng thư số tổ chức",
    issuer: "VIETTEL-CA",
    serial: "FEDCBA9876543210",
    expiresIn: 28,
    status: "expiring",
  },
  {
    id: "3",
    name: "Chứng thư dự phòng",
    issuer: "FPT-CA",
    serial: "ABCDEF0123456789",
    expiresIn: -5,
    status: "expired",
  },
];

const statusConfig = {
  valid: {
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success",
    label: "Còn hiệu lực",
  },
  expiring: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning",
    label: "Sắp hết hạn",
  },
  expired: {
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive",
    label: "Đã hết hạn",
  },
};

export function CertificateStatus() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border p-5">
        <h3 className="text-lg font-semibold">Chứng thư số</h3>
        <p className="text-sm text-muted-foreground">
          Trạng thái các chứng thư đang quản lý
        </p>
      </div>
      <div className="divide-y divide-border">
        {certificates.map((cert) => {
          const status = statusConfig[cert.status];
          const StatusIcon = status.icon;
          const daysPercent =
            cert.status === "expired"
              ? 0
              : Math.min(100, (cert.expiresIn / 365) * 100);

          return (
            <div key={cert.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5">
                    <Key className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cert.issuer} • {cert.serial.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className={cn("flex items-center gap-1.5", status.color)}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Thời hạn còn lại
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      cert.status === "expired"
                        ? "text-destructive"
                        : cert.status === "expiring"
                          ? "text-warning"
                          : "text-foreground",
                    )}
                  >
                    {cert.status === "expired"
                      ? `Hết hạn ${Math.abs(cert.expiresIn)} ngày trước`
                      : `${cert.expiresIn} ngày`}
                  </span>
                </div>
                <Progress
                  value={daysPercent}
                  className={cn(
                    "h-1.5",
                    cert.status === "expired" && "[&>div]:bg-destructive",
                    cert.status === "expiring" && "[&>div]:bg-warning",
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
