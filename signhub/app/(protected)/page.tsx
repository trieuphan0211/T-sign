'use client";';
import { CertificateStatus } from "@/components/dashboard/certificate-status";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { StatCard } from "@/components/dashboard/stat-card";
import { WorkflowProgress } from "@/components/dashboard/workflow-progress";
import {
  FileText,
  PenTool,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground">
          Xin chào! Đây là tổng quan hoạt động ký số của bạn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Chờ tôi ký"
          value={12}
          subtitle="Cần xử lý trong hôm nay"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Đã ký trong tuần"
          value={47}
          icon={CheckCircle}
          trend={{ value: 12, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Tổng tài liệu"
          value={234}
          subtitle="Tháng này"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Đang chờ người khác"
          value={8}
          icon={PenTool}
          variant="pending"
        />
        <StatCard
          title="Sắp hết hạn"
          value={3}
          subtitle="Chứng thư số"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Thao tác nhanh</h2>
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Documents - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <RecentDocuments />
          <WorkflowProgress />
        </div>

        {/* Right Sidebar - Certificate Status */}
        <div>
          <CertificateStatus />
        </div>
      </div>
    </div>
  );
}
