"use client";
import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  Eye,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  signerCount: number;
  signingType: "sequential" | "parallel";
  documentsUsed: number;
  createdAt: string;
  updatedAt: string;
}

const workflows: Workflow[] = [
  {
    id: "1",
    name: "Hợp đồng lao động",
    description: "Luồng ký hợp đồng lao động chuẩn",
    status: "active",
    signerCount: 3,
    signingType: "sequential",
    documentsUsed: 45,
    createdAt: "2024-01-15",
    updatedAt: "2024-03-10",
  },
  {
    id: "2",
    name: "Phê duyệt mua sắm",
    description: "Quy trình phê duyệt đơn mua sắm thiết bị",
    status: "active",
    signerCount: 4,
    signingType: "sequential",
    documentsUsed: 128,
    createdAt: "2024-02-01",
    updatedAt: "2024-03-12",
  },
  {
    id: "3",
    name: "Hợp đồng dịch vụ",
    description: "Ký kết hợp đồng với đối tác",
    status: "paused",
    signerCount: 2,
    signingType: "sequential",
    documentsUsed: 23,
    createdAt: "2024-01-20",
    updatedAt: "2024-02-28",
  },
  {
    id: "4",
    name: "Biên bản họp",
    description: "Xác nhận biên bản cuộc họp",
    status: "active",
    signerCount: 5,
    signingType: "parallel",
    documentsUsed: 67,
    createdAt: "2024-02-10",
    updatedAt: "2024-03-11",
  },
  {
    id: "5",
    name: "Báo cáo tài chính",
    description: "Phê duyệt báo cáo tài chính quý",
    status: "draft",
    signerCount: 3,
    signingType: "sequential",
    documentsUsed: 0,
    createdAt: "2024-03-01",
    updatedAt: "2024-03-01",
  },
];

const statusConfig = {
  active: {
    label: "Hoạt động",
    icon: CheckCircle,
    variant: "default" as const,
  },
  paused: {
    label: "Tạm dừng",
    icon: AlertCircle,
    variant: "secondary" as const,
  },
  draft: {
    label: "Nháp",
    icon: XCircle,
    variant: "outline" as const,
  },
};

export default function Workflows() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(search.toLowerCase()) ||
      workflow.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (action: string, workflow: Workflow) => {
    switch (action) {
      case "edit":
        router.push(`/workflows/create?edit=${workflow.id}`);
        break;
      case "duplicate":
        toast("Đã sao chép", {
          description: `Đã tạo bản sao của "${workflow.name}"`,
        });
        break;
      case "toggle":
        toast(workflow.status === "active" ? "Đã tạm dừng" : "Đã kích hoạt", {
          description: `Luồng "${workflow.name}" đã được ${
            workflow.status === "active" ? "tạm dừng" : "kích hoạt"
          }`,
        });
        break;
      case "delete":
        toast("Đã xóa", {
          description: `Luồng "${workflow.name}" đã được xóa`,
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tất cả luồng</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các luồng công việc ký số
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/workflows/templates")}
          >
            Mẫu luồng
          </Button>
          <Button onClick={() => router.push("/workflows/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo luồng mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {workflows.filter((w) => w.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {workflows.reduce((acc, w) => acc + w.documentsUsed, 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tài liệu đã xử lý
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {workflows.reduce((acc, w) => acc + w.signerCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Tổng người ký</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm luồng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="paused">Tạm dừng</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên luồng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người ký</TableHead>
              <TableHead>Kiểu ký</TableHead>
              <TableHead>Tài liệu</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkflows.map((workflow) => {
              const status = statusConfig[workflow.status];
              const StatusIcon = status.icon;
              return (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {workflow.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {workflow.signerCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {workflow.signingType === "sequential"
                        ? "Tuần tự"
                        : "Song song"}
                    </Badge>
                  </TableCell>
                  <TableCell>{workflow.documentsUsed}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {workflow.updatedAt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/workflows/${workflow.id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("edit", workflow)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("duplicate", workflow)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Sao chép
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("toggle", workflow)}
                        >
                          {workflow.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Tạm dừng
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleAction("delete", workflow)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Không tìm thấy luồng</h3>
          <p className="text-muted-foreground mt-1">
            Thử tìm kiếm với từ khóa khác hoặc tạo luồng mới
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/workflows/create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo luồng mới
          </Button>
        </div>
      )}
    </div>
  );
}
