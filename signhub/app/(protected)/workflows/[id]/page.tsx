"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  Eye,
  File,
  FileText,
  Mail,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
}

interface Document {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  currentSigner: string;
  addedAt: string;
  completedSigners: number;
  totalSigners: number;
}

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
  signers: Signer[];
  documents: Document[];
}

interface AvailableDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  createdAt: string;
}

const availableDocuments: AvailableDocument[] = [
  {
    id: "d1",
    name: "Hợp đồng lao động - Nguyễn Văn X.pdf",
    type: "PDF",
    size: "2.4 MB",
    createdAt: "2024-03-15",
  },
  {
    id: "d2",
    name: "Phụ lục hợp đồng.pdf",
    type: "PDF",
    size: "1.2 MB",
    createdAt: "2024-03-14",
  },
  {
    id: "d3",
    name: "Biên bản bàn giao.docx",
    type: "DOCX",
    size: "856 KB",
    createdAt: "2024-03-13",
  },
  {
    id: "d4",
    name: "Quyết định bổ nhiệm.pdf",
    type: "PDF",
    size: "1.8 MB",
    createdAt: "2024-03-12",
  },
  {
    id: "d5",
    name: "Thỏa thuận bảo mật.pdf",
    type: "PDF",
    size: "945 KB",
    createdAt: "2024-03-11",
  },
];

const workflowsData: Record<string, Workflow> = {
  "1": {
    id: "1",
    name: "Hợp đồng lao động",
    description:
      "Luồng ký hợp đồng lao động chuẩn cho nhân viên mới. Bao gồm các bước xác nhận từ HR, quản lý trực tiếp và ban giám đốc.",
    status: "active",
    signerCount: 3,
    signingType: "sequential",
    documentsUsed: 45,
    createdAt: "2024-01-15",
    updatedAt: "2024-03-10",
    signers: [
      {
        id: "s1",
        name: "Nguyễn Văn A",
        email: "nva@company.com",
        role: "Trưởng phòng HR",
        order: 1,
      },
      {
        id: "s2",
        name: "Trần Thị B",
        email: "ttb@company.com",
        role: "Quản lý trực tiếp",
        order: 2,
      },
      {
        id: "s3",
        name: "Lê Văn C",
        email: "lvc@company.com",
        role: "Giám đốc",
        order: 3,
      },
    ],
    documents: [
      {
        id: "doc1",
        name: "HĐ-2024-045.pdf",
        status: "completed",
        currentSigner: "",
        addedAt: "2024-03-10",
        completedSigners: 3,
        totalSigners: 3,
      },
      {
        id: "doc2",
        name: "HĐ-2024-046.pdf",
        status: "in_progress",
        currentSigner: "Trần Thị B",
        addedAt: "2024-03-12",
        completedSigners: 1,
        totalSigners: 3,
      },
      {
        id: "doc3",
        name: "HĐ-2024-047.pdf",
        status: "pending",
        currentSigner: "Nguyễn Văn A",
        addedAt: "2024-03-14",
        completedSigners: 0,
        totalSigners: 3,
      },
    ],
  },
  "2": {
    id: "2",
    name: "Phê duyệt mua sắm",
    description:
      "Quy trình phê duyệt đơn mua sắm thiết bị văn phòng và công nghệ.",
    status: "active",
    signerCount: 4,
    signingType: "sequential",
    documentsUsed: 128,
    createdAt: "2024-02-01",
    updatedAt: "2024-03-12",
    signers: [
      {
        id: "s1",
        name: "Phạm Văn D",
        email: "pvd@company.com",
        role: "Người yêu cầu",
        order: 1,
      },
      {
        id: "s2",
        name: "Hoàng Thị E",
        email: "hte@company.com",
        role: "Trưởng bộ phận",
        order: 2,
      },
      {
        id: "s3",
        name: "Vũ Văn F",
        email: "vvf@company.com",
        role: "Kế toán trưởng",
        order: 3,
      },
      {
        id: "s4",
        name: "Đặng Thị G",
        email: "dtg@company.com",
        role: "Giám đốc tài chính",
        order: 4,
      },
    ],
    documents: [
      {
        id: "doc1",
        name: "PR-2024-128.pdf",
        status: "completed",
        currentSigner: "",
        addedAt: "2024-03-08",
        completedSigners: 4,
        totalSigners: 4,
      },
      {
        id: "doc2",
        name: "PR-2024-129.pdf",
        status: "in_progress",
        currentSigner: "Vũ Văn F",
        addedAt: "2024-03-11",
        completedSigners: 2,
        totalSigners: 4,
      },
    ],
  },
  "3": {
    id: "3",
    name: "Hợp đồng dịch vụ",
    description: "Ký kết hợp đồng với đối tác cung cấp dịch vụ bên ngoài.",
    status: "paused",
    signerCount: 2,
    signingType: "sequential",
    documentsUsed: 23,
    createdAt: "2024-01-20",
    updatedAt: "2024-02-28",
    signers: [
      {
        id: "s1",
        name: "Ngô Văn H",
        email: "nvh@company.com",
        role: "Trưởng phòng pháp chế",
        order: 1,
      },
      {
        id: "s2",
        name: "Bùi Thị I",
        email: "bti@company.com",
        role: "Giám đốc",
        order: 2,
      },
    ],
    documents: [],
  },
  "4": {
    id: "4",
    name: "Biên bản họp",
    description: "Xác nhận biên bản cuộc họp ban lãnh đạo.",
    status: "active",
    signerCount: 5,
    signingType: "parallel",
    documentsUsed: 67,
    createdAt: "2024-02-10",
    updatedAt: "2024-03-11",
    signers: [
      {
        id: "s1",
        name: "Trịnh Văn K",
        email: "tvk@company.com",
        role: "Thành viên HĐQT",
        order: 1,
      },
      {
        id: "s2",
        name: "Lý Thị L",
        email: "ltl@company.com",
        role: "Thành viên HĐQT",
        order: 1,
      },
      {
        id: "s3",
        name: "Mạc Văn M",
        email: "mvm@company.com",
        role: "Thành viên HĐQT",
        order: 1,
      },
      {
        id: "s4",
        name: "Đinh Thị N",
        email: "dtn@company.com",
        role: "Thành viên HĐQT",
        order: 1,
      },
      {
        id: "s5",
        name: "Dương Văn O",
        email: "dvo@company.com",
        role: "Chủ tịch HĐQT",
        order: 1,
      },
    ],
    documents: [
      {
        id: "doc1",
        name: "BB-2024-067.pdf",
        status: "in_progress",
        currentSigner: "Đang chờ ký",
        addedAt: "2024-03-11",
        completedSigners: 3,
        totalSigners: 5,
      },
    ],
  },
  "5": {
    id: "5",
    name: "Báo cáo tài chính",
    description: "Phê duyệt báo cáo tài chính quý.",
    status: "draft",
    signerCount: 3,
    signingType: "sequential",
    documentsUsed: 0,
    createdAt: "2024-03-01",
    updatedAt: "2024-03-01",
    signers: [
      {
        id: "s1",
        name: "Cao Văn P",
        email: "cvp@company.com",
        role: "Kế toán viên",
        order: 1,
      },
      {
        id: "s2",
        name: "Tạ Thị Q",
        email: "ttq@company.com",
        role: "Kế toán trưởng",
        order: 2,
      },
      {
        id: "s3",
        name: "Hồ Văn R",
        email: "hvr@company.com",
        role: "Giám đốc tài chính",
        order: 3,
      },
    ],
    documents: [],
  },
};

const statusConfig = {
  active: {
    label: "Hoạt động",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-primary",
  },
  paused: {
    label: "Tạm dừng",
    icon: AlertCircle,
    variant: "secondary" as const,
    color: "text-secondary-foreground",
  },
  draft: {
    label: "Nháp",
    icon: XCircle,
    variant: "outline" as const,
    color: "text-muted-foreground",
  },
};

const docStatusConfig = {
  pending: {
    label: "Chờ ký",
    variant: "outline" as const,
  },
  in_progress: {
    label: "Đang ký",
    variant: "secondary" as const,
  },
  completed: {
    label: "Hoàn tất",
    variant: "default" as const,
  },
  rejected: {
    label: "Từ chối",
    variant: "destructive" as const,
  },
};

export default function WorkflowDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [searchDoc, setSearchDoc] = useState("");

  const workflow = id ? workflowsData[id] : null;

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Không tìm thấy luồng</h2>
        <p className="text-muted-foreground mt-2">
          Luồng công việc này không tồn tại.
        </p>
        <Button className="mt-4" onClick={() => router.push("/workflows")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const status = statusConfig[workflow.status];
  const StatusIcon = status.icon;

  const filteredAvailableDocs = availableDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchDoc.toLowerCase()),
  );

  const handleAction = (action: string) => {
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
          description: `Luồng "${workflow.name}" đã được ${workflow.status === "active" ? "tạm dừng" : "kích hoạt"}`,
        });
        break;
      case "delete":
        toast("Đã xóa", {
          description: `Luồng "${workflow.name}" đã được xóa`,
        });
        router.push("/workflows");
        break;
    }
  };

  const handleAddDocuments = () => {
    if (selectedDocs.length === 0) {
      toast("Chưa chọn tài liệu", {
        description: "Vui lòng chọn ít nhất một tài liệu để thêm vào luồng",
      });
      return;
    }
    toast("Đã thêm tài liệu", {
      description: `Đã thêm ${selectedDocs.length} tài liệu vào luồng "${workflow.name}"`,
    });
    setSelectedDocs([]);
    setIsAddDocOpen(false);
  };

  const handleDocAction = (action: string, doc: Document) => {
    switch (action) {
      case "view":
        router.push(`/documents/${doc.id}`);
        break;
      case "sign":
        router.push(`/signing-room/${doc.id}`);
        break;
      case "remove":
        toast("Đã xóa tài liệu", {
          description: `Tài liệu "${doc.name}" đã được xóa khỏi luồng`,
        });
        break;
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/workflows")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {workflow.name}
              </h1>
              <Badge variant={status.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{workflow.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleAction("duplicate")}>
            <Copy className="h-4 w-4 mr-2" />
            Sao chép
          </Button>
          <Button variant="outline" onClick={() => handleAction("toggle")}>
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
          </Button>
          <Button onClick={() => handleAction("edit")}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents in Workflow */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tài liệu trong luồng ({workflow.documents.length})
              </CardTitle>
              <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tài liệu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Thêm tài liệu vào luồng</DialogTitle>
                    <DialogDescription>
                      Chọn tài liệu từ thư viện hoặc tải lên tài liệu mới để
                      thêm vào luồng &quot;{workflow.name}&quot;
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tìm kiếm tài liệu..."
                        value={searchDoc}
                        onChange={(e) => setSearchDoc(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Tải lên
                      </Button>
                    </div>
                    <div className="border rounded-lg max-h-[300px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Tên tài liệu</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Kích thước</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAvailableDocs.map((doc) => (
                            <TableRow
                              key={doc.id}
                              className="cursor-pointer"
                              onClick={() => toggleDocSelection(doc.id)}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedDocs.includes(doc.id)}
                                  onCheckedChange={() =>
                                    toggleDocSelection(doc.id)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {doc.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{doc.type}</Badge>
                              </TableCell>
                              <TableCell>{doc.size}</TableCell>
                              <TableCell>{doc.createdAt}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {selectedDocs.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Đã chọn {selectedDocs.length} tài liệu
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDocOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button onClick={handleAddDocuments}>
                      Thêm{" "}
                      {selectedDocs.length > 0
                        ? `(${selectedDocs.length})`
                        : ""}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {workflow.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Chưa có tài liệu nào trong luồng
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setIsAddDocOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tài liệu đầu tiên
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tài liệu</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Tiến độ</TableHead>
                      <TableHead>Người ký hiện tại</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflow.documents.map((doc) => {
                      const docStatus = docStatusConfig[doc.status];
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{doc.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={docStatus.variant}>
                              {docStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{
                                    width: `${(doc.completedSigners / doc.totalSigners) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {doc.completedSigners}/{doc.totalSigners}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {doc.currentSigner ? (
                              <span className="text-sm">
                                {doc.currentSigner}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            )}
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
                                  onClick={() => handleDocAction("view", doc)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                {doc.status !== "completed" && (
                                  <DropdownMenuItem
                                    onClick={() => handleDocAction("sign", doc)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Đi đến ký
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDocAction("remove", doc)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa khỏi luồng
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Signers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Danh sách người ký ({workflow.signerCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.signers.map((signer, index) => (
                  <div key={signer.id}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {workflow.signingType === "sequential"
                          ? signer.order
                          : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{signer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {signer.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {signer.email}
                      </div>
                    </div>
                    {workflow.signingType === "sequential" &&
                      index < workflow.signers.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm">
                      Tài liệu &quot;HĐ-2024-045&quot; đã được ký hoàn tất
                    </p>
                    <p className="text-xs text-muted-foreground">2 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-2 w-2 rounded-full bg-secondary mt-2" />
                  <div>
                    <p className="text-sm">
                      Nguyễn Văn A đã ký tài liệu &quot;HĐ-2024-044&quot;
                    </p>
                    <p className="text-xs text-muted-foreground">5 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-2 w-2 rounded-full bg-secondary mt-2" />
                  <div>
                    <p className="text-sm">
                      Tài liệu mới &quot;HĐ-2024-046&quot; được thêm vào luồng
                    </p>
                    <p className="text-xs text-muted-foreground">
                      1 ngày trước
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kiểu ký</span>
                <Badge variant="outline">
                  {workflow.signingType === "sequential"
                    ? "Tuần tự"
                    : "Song song"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tài liệu đã xử lý
                </span>
                <span className="font-semibold">{workflow.documentsUsed}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Số người ký
                </span>
                <span className="font-semibold">{workflow.signerCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thời gian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{workflow.createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cập nhật lần cuối
                  </p>
                  <p className="font-medium">{workflow.updatedAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Xóa luồng công việc này sẽ không thể khôi phục. Các tài liệu đã
                ký vẫn được giữ nguyên.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleAction("delete")}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa luồng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
