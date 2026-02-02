"use client";
import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Grid,
  List,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DocumentUpload } from "@/components/documents/document-upload";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "pending" | "signed" | "rejected" | "draft" | "expired";
  createdAt: string;
  updatedAt: string;
  owner: string;
  tags: string[];
  deadline?: string;
}

const documents: Document[] = [
  {
    id: "1",
    name: "Hợp đồng lao động #2024-001.pdf",
    type: "PDF",
    size: "2.4 MB",
    status: "pending",
    createdAt: "15/12/2024",
    updatedAt: "5 phút trước",
    owner: "Nguyễn Văn A",
    tags: ["Hợp đồng", "Nhân sự"],
    deadline: "22/12/2024",
  },
  {
    id: "2",
    name: "Biên bản họp HĐQT Q4-2024.pdf",
    type: "PDF",
    size: "1.8 MB",
    status: "signed",
    createdAt: "14/12/2024",
    updatedAt: "1 giờ trước",
    owner: "Trần Thị B",
    tags: ["Biên bản", "HĐQT"],
  },
  {
    id: "3",
    name: "Báo cáo tài chính Q3.docx",
    type: "DOCX",
    size: "3.2 MB",
    status: "expired",
    createdAt: "13/12/2024",
    updatedAt: "2 giờ trước",
    owner: "Lê Văn C",
    tags: ["Báo cáo", "Tài chính"],
    deadline: "20/12/2024",
  },
  {
    id: "4",
    name: "Quyết định bổ nhiệm #123.pdf",
    type: "PDF",
    size: "856 KB",
    status: "rejected",
    createdAt: "12/12/2024",
    updatedAt: "3 giờ trước",
    owner: "Phạm D",
    tags: ["Quyết định"],
  },
  {
    id: "5",
    name: "Hợp đồng thuê mặt bằng.pdf",
    type: "PDF",
    size: "4.1 MB",
    status: "draft",
    createdAt: "11/12/2024",
    updatedAt: "1 ngày trước",
    owner: "Nguyễn Văn A",
    tags: ["Hợp đồng"],
  },
  {
    id: "6",
    name: "Thỏa thuận bảo mật NDA.pdf",
    type: "PDF",
    size: "1.2 MB",
    status: "pending",
    createdAt: "10/12/2024",
    updatedAt: "2 ngày trước",
    owner: "Hoàng E",
    tags: ["Hợp đồng", "Bảo mật"],
    deadline: "25/12/2024",
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
  draft: {
    label: "Nháp",
    icon: FileText,
    className: "bg-muted text-muted-foreground border-muted",
  },
  expired: {
    label: "Hết hạn",
    icon: Clock,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function Documents() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedDocs((prev) =>
      prev.length === documents.length ? [] : documents.map((d) => d.id),
    );
  };

  const handleUploadComplete = (files: File[]) => {
    toast("Tải lên thành công", {
      description: `Đã tải lên ${files.length} tài liệu`,
    });
  };
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tài liệu</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả tài liệu của bạn
          </p>
        </div>
        <Button className="gap-2" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" />
          Tải tài liệu
        </Button>
      </div>

      <DocumentUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={handleUploadComplete}
      />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm kiếm tài liệu..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ ký</SelectItem>
              <SelectItem value="signed">Đã ký</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="flex border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-r-none",
                viewMode === "list" && "bg-muted",
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-l-none",
                viewMode === "grid" && "bg-muted",
              )}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedDocs.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">
            Đã chọn {selectedDocs.length} tài liệu
          </span>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                router.push(`/signing-room/${selectedDocs[0]}`);
              }}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Ký tài liệu
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Tải xuống
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="p-4 text-left w-12">
                <Checkbox
                  checked={selectedDocs.length === documents.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Tên tài liệu
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                Loại
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">
                Kích thước
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Trạng thái
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                Cập nhật
              </th>
              <th className="p-4 text-right text-sm font-medium text-muted-foreground w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc) => {
              const status = statusConfig[doc.status];
              const StatusIcon = status.icon;

              return (
                <tr
                  key={doc.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={() => toggleSelect(doc.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.owner}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <Badge variant="secondary">{doc.type}</Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {doc.size}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className={cn("gap-1", status.className)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                    {doc.updatedAt}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {doc.status === "pending" && (
                          <DropdownMenuItem
                            className="gap-2 text-primary"
                            onClick={() =>
                              router.push(`/signing-room/${doc.id}`)
                            }
                          >
                            <PenTool className="h-4 w-4" />
                            Ký tài liệu
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => router.push(`/documents/${doc.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          Xem
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Tải xuống
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
