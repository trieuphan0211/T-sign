/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  FileStack,
  CheckCircle,
  Key,
  Shield,
  Loader2,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BulkDocument {
  id: string;
  name: string;
  size: string;
  status: "pending" | "signing" | "signed" | "error";
  errorMessage?: string;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  status: "valid" | "expiring";
}

interface BulkSigningPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents?: BulkDocument[];
  onComplete?: (signedDocIds: string[]) => void;
}

const mockCertificates: Certificate[] = [
  {
    id: "cert-1",
    name: "Nguyễn Văn A - Cá nhân",
    issuer: "VNPT-CA",
    status: "valid",
  },
  {
    id: "cert-2",
    name: "Công ty TNHH ABC",
    issuer: "VIETTEL-CA",
    status: "valid",
  },
];

const mockDocuments: BulkDocument[] = [
  { id: "1", name: "Hóa đơn GTGT #001.pdf", size: "125 KB", status: "pending" },
  { id: "2", name: "Hóa đơn GTGT #002.pdf", size: "128 KB", status: "pending" },
  { id: "3", name: "Hóa đơn GTGT #003.pdf", size: "122 KB", status: "pending" },
  {
    id: "4",
    name: "Hợp đồng mua bán #101.pdf",
    size: "1.2 MB",
    status: "pending",
  },
  {
    id: "5",
    name: "Hợp đồng mua bán #102.pdf",
    size: "1.1 MB",
    status: "pending",
  },
  {
    id: "6",
    name: "Hợp đồng mua bán #103.pdf",
    size: "1.3 MB",
    status: "pending",
  },
  {
    id: "7",
    name: "Biên bản nghiệm thu #201.pdf",
    size: "856 KB",
    status: "pending",
  },
  {
    id: "8",
    name: "Biên bản nghiệm thu #202.pdf",
    size: "892 KB",
    status: "pending",
  },
];

export function BulkSigningPanel({
  open,
  onOpenChange,
  documents = mockDocuments,
  onComplete,
}: BulkSigningPanelProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDocs, setSelectedDocs] = useState<string[]>(
    documents.map((d) => d.id),
  );
  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [verificationMethod, setVerificationMethod] = useState<"email" | "otp">(
    "otp",
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [signingProgress, setSigningProgress] = useState(0);
  const [bulkDocs, setBulkDocs] = useState<BulkDocument[]>(documents);

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedDocs((prev) =>
      prev.length === documents.length ? [] : documents.map((d) => d.id),
    );
  };

  const handleSendCode = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    toast.success(
      verificationMethod === "email"
        ? "Mã xác thực đã được gửi đến email của bạn"
        : "Mã OTP đã được gửi đến số điện thoại của bạn",
    );
  };

  const handleStartSigning = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Vui lòng nhập mã xác thực 6 số");
      return;
    }

    setIsProcessing(true);
    setStep(4);

    // Simulate signing each document
    for (let i = 0; i < selectedDocs.length; i++) {
      const docId = selectedDocs[i];

      // Update status to signing
      setBulkDocs((prev) =>
        prev.map((d) =>
          d.id === docId ? { ...d, status: "signing" as const } : d,
        ),
      );

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Randomly fail some for demo (10% chance)
      const shouldFail = Math.random() < 0.1;

      setBulkDocs((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: shouldFail ? ("error" as const) : ("signed" as const),
                errorMessage: shouldFail ? "Lỗi kết nối HSM" : undefined,
              }
            : d,
        ),
      );

      setSigningProgress(((i + 1) / selectedDocs.length) * 100);
    }

    setIsProcessing(false);

    const signedCount = bulkDocs.filter((d) => d.status === "signed").length;
    toast.success(
      `Đã ký thành công ${signedCount}/${selectedDocs.length} tài liệu`,
    );

    onComplete?.(
      selectedDocs.filter((id) => {
        const doc = bulkDocs.find((d) => d.id === id);
        return doc?.status === "signed";
      }),
    );
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDocs(documents.map((d) => d.id));
    setSelectedCertificate("");
    setVerificationCode("");
    setSigningProgress(0);
    setBulkDocs(documents);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileStack className="h-5 w-5" />
            Ký lô (Bulk Signing)
          </DialogTitle>
          <DialogDescription>
            Ký nhiều tài liệu cùng lúc với một lần xác thực OTP
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === s && "bg-primary text-primary-foreground",
                  step > s && "bg-success text-success-foreground",
                  step < s && "bg-muted text-muted-foreground",
                )}
              >
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              <span className="text-sm hidden sm:block">
                {s === 1 && "Chọn tài liệu"}
                {s === 2 && "Chọn CTS"}
                {s === 3 && "Xác thực"}
                {s === 4 && "Ký lô"}
              </span>
              {s < 4 && <div className="flex-1 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Documents */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Chọn tài liệu cần ký ({selectedDocs.length}/{documents.length})
              </Label>
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedDocs.length === documents.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
            </div>

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/30 cursor-pointer",
                    selectedDocs.includes(doc.id) && "bg-primary/5",
                  )}
                  onClick={() => toggleDoc(doc.id)}
                >
                  <Checkbox checked={selectedDocs.includes(doc.id)} />
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Certificate */}
        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Chọn chứng thư số để ký {selectedDocs.length} tài liệu
            </Label>

            <div className="space-y-2">
              {mockCertificates.map((cert) => (
                <Card
                  key={cert.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedCertificate === cert.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "hover:border-muted-foreground/30",
                  )}
                  onClick={() => setSelectedCertificate(cert.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        selectedCertificate === cert.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <Key className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cert.issuer}
                      </p>
                    </div>
                    <Badge
                      variant={
                        cert.status === "valid" ? "default" : "secondary"
                      }
                    >
                      {cert.status === "valid" ? "Còn hiệu lực" : "Sắp hết hạn"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Xác thực một lần để ký {selectedDocs.length} tài liệu
                </CardTitle>
                <CardDescription>
                  Bạn chỉ cần xác thực một lần duy nhất cho tất cả tài liệu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={verificationMethod}
                  onValueChange={(v) =>
                    setVerificationMethod(v as "email" | "otp")
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="otp" id="bulk-otp" />
                    <Label htmlFor="bulk-otp" className="flex-1 cursor-pointer">
                      OTP qua SMS (Nhanh hơn)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="email" id="bulk-email" />
                    <Label
                      htmlFor="bulk-email"
                      className="flex-1 cursor-pointer"
                    >
                      Mã xác thực qua Email
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleSendCode}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã xác thực"
                )}
              </Button>

              <div className="space-y-2">
                <Label>Nhập mã xác thực (6 số)</Label>
                <Input
                  placeholder="000000"
                  className="text-center tracking-widest font-mono text-lg"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Signing Progress */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold">
                {isProcessing ? "Đang ký lô..." : "Hoàn tất ký lô"}
              </h3>
              <p className="text-muted-foreground">
                {isProcessing
                  ? `Đang xử lý ${selectedDocs.length} tài liệu`
                  : `Đã ký ${bulkDocs.filter((d) => d.status === "signed").length}/${selectedDocs.length} tài liệu`}
              </p>
            </div>

            <Progress value={signingProgress} className="h-2" />

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {bulkDocs
                .filter((d) => selectedDocs.includes(d.id))
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border-b last:border-b-0"
                  >
                    {doc.status === "pending" && (
                      <div className="w-5 h-5 rounded-full border-2" />
                    )}
                    {doc.status === "signing" && (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    )}
                    {doc.status === "signed" && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {doc.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      {doc.errorMessage && (
                        <p className="text-xs text-destructive">
                          {doc.errorMessage}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        doc.status === "signed"
                          ? "default"
                          : doc.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {doc.status === "pending" && "Chờ"}
                      {doc.status === "signing" && "Đang ký"}
                      {doc.status === "signed" && "Đã ký"}
                      {doc.status === "error" && "Lỗi"}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={
              step === 1 ? handleClose : () => setStep((s) => (s - 1) as any)
            }
          >
            {step === 1 ? "Hủy" : "Quay lại"}
          </Button>

          {step < 3 && (
            <Button
              onClick={() => setStep((s) => (s + 1) as any)}
              disabled={
                (step === 1 && selectedDocs.length === 0) ||
                (step === 2 && !selectedCertificate)
              }
            >
              Tiếp tục
            </Button>
          )}

          {step === 3 && (
            <Button
              onClick={handleStartSigning}
              disabled={verificationCode.length !== 6 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                `Ký ${selectedDocs.length} tài liệu`
              )}
            </Button>
          )}

          {step === 4 && !isProcessing && (
            <Button onClick={handleClose}>Đóng</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
