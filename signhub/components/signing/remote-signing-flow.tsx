/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Shield,
  Key,
  PenTool,
  Mail,
  Smartphone,
  Check,
  ChevronRight,
  AlertCircle,
  Loader2,
  FileText,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SignaturePad } from "./signature-pad";
import { SigningReasonForm } from "./signing-reason-form";
import Image from "next/image";

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  status: "valid" | "expiring" | "expired";
}

interface RemoteSigningFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    certificateId: string;
    signatureImage: string;
    verificationMethod: "email" | "otp";
    signingReason?: string;
    location?: string;
  }) => void;
  documentName?: string;
  requireReason?: boolean;
  requireLocation?: boolean;
}

const mockCertificates: Certificate[] = [
  {
    id: "cert-1",
    name: "Nguyễn Văn A - Cá nhân",
    issuer: "VNPT-CA",
    serialNumber: "1234567890ABCDEF",
    validFrom: "2024-01-01",
    validTo: "2025-01-01",
    status: "valid",
  },
  {
    id: "cert-2",
    name: "Công ty TNHH ABC",
    issuer: "VIETTEL-CA",
    serialNumber: "ABCDEF1234567890",
    validFrom: "2024-06-01",
    validTo: "2025-06-01",
    status: "valid",
  },
  {
    id: "cert-3",
    name: "Nguyễn Văn A - Công ty",
    issuer: "FPT-CA",
    serialNumber: "FEDCBA0987654321",
    validFrom: "2023-01-01",
    validTo: "2024-02-15",
    status: "expiring",
  },
];

export function RemoteSigningFlow({
  open,
  onOpenChange,
  onComplete,
  documentName = "Tài liệu",
  requireReason = true,
  requireLocation = true,
}: RemoteSigningFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [signatureImage, setSignatureImage] = useState<string>("");
  const [verificationMethod, setVerificationMethod] = useState<"email" | "otp">(
    "email",
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  // New fields for signing reason and location
  const [signingReason, setSigningReason] = useState("");
  const [location, setLocation] = useState("");

  const steps = [
    { number: 1, title: "Chọn CTS", icon: Key },
    { number: 2, title: "Lý do & Vị trí", icon: FileText },
    { number: 3, title: "Tạo chữ ký", icon: PenTool },
    { number: 4, title: "Xác thực", icon: Shield },
    { number: 5, title: "Hoàn tất", icon: Check },
  ];

  const handleSendCode = async () => {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsVerifying(false);
    setCodeSent(true);
    toast.success(
      verificationMethod === "email"
        ? "Mã xác thực đã được gửi đến email của bạn"
        : "Mã OTP đã được gửi đến số điện thoại của bạn",
    );
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ mã xác thực");
      return;
    }

    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsVerifying(false);
    setStep(5);

    // Complete the signing
    onComplete({
      certificateId: selectedCertificate,
      signatureImage,
      verificationMethod,
      signingReason,
      location,
    });
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCertificate("");
    setSignatureImage("");
    setVerificationCode("");
    setCodeSent(false);
    setSigningReason("");
    setLocation("");
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedCertificate;
      case 2:
        const reasonValid = !requireReason || !!signingReason;
        const locationValid = !requireLocation || !!location;
        return reasonValid && locationValid;
      case 3:
        return !!signatureImage;
      case 4:
        return codeSent && verificationCode.length === 6;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ký số từ xa (Remote Signing)</DialogTitle>
          <DialogDescription>
            Ký tài liệu &quot;{documentName}&quot; với chứng thư số của bạn
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-colors",
                  step === s.number && "bg-primary/10",
                  step > s.number && "text-success",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step === s.number && "bg-primary text-primary-foreground",
                    step > s.number && "bg-success text-success-foreground",
                    step < s.number && "bg-muted text-muted-foreground",
                  )}
                >
                  {step > s.number ? <Check className="h-4 w-4" /> : s.number}
                </div>
                <span
                  className={cn(
                    "text-sm hidden sm:block",
                    step === s.number && "font-medium",
                    step < s.number && "text-muted-foreground",
                  )}
                >
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Certificate */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Chọn chứng thư số để ký</h3>
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
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
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
                        <div>
                          <h4 className="font-medium">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            SN: {cert.serialNumber.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          cert.status === "valid"
                            ? "default"
                            : cert.status === "expiring"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {cert.status === "valid" && "Còn hiệu lực"}
                        {cert.status === "expiring" && "Sắp hết hạn"}
                        {cert.status === "expired" && "Hết hạn"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>
                        Từ:{" "}
                        {new Date(cert.validFrom).toLocaleDateString("vi-VN")}
                      </span>
                      <span>
                        Đến:{" "}
                        {new Date(cert.validTo).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Signing Reason & Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">
              Thông tin ký số (eIDAS / Pháp luật VN)
            </h3>
            <SigningReasonForm
              signingReason={signingReason}
              onSigningReasonChange={setSigningReason}
              location={location}
              onLocationChange={setLocation}
            />
          </div>
        )}

        {/* Step 3: Create Signature */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Tạo chữ ký điện tử</h3>
            {!signatureImage ? (
              <SignaturePad
                onSave={(data) => {
                  setSignatureImage(data);
                  toast.success("Đã lưu chữ ký");
                }}
                onCancel={() => setStep(2)}
              />
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-2">Chữ ký của bạn:</p>
                  <Image
                    src={signatureImage}
                    alt="Signature preview"
                    className="max-h-24 mx-auto border rounded bg-white p-2"
                    width={200}
                    height={80}
                    unoptimized
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSignatureImage("")}
                  >
                    Vẽ lại
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(4)}>
                    Tiếp tục
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Xác thực ký số</h3>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Chọn phương thức xác thực
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={verificationMethod}
                  onValueChange={(v) => {
                    setVerificationMethod(v as "email" | "otp");
                    setCodeSent(false);
                    setVerificationCode("");
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="email" id="email" />
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Xác thực qua Email</p>
                        <p className="text-sm text-muted-foreground">
                          Nhận mã xác thực qua email đã đăng ký
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="otp" id="otp" />
                    <Label
                      htmlFor="otp"
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Xác thực qua OTP</p>
                        <p className="text-sm text-muted-foreground">
                          Nhận mã OTP qua SMS đến số điện thoại
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {!codeSent ? (
                <Button
                  className="w-full"
                  onClick={handleSendCode}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>Gửi mã xác thực</>
                  )}
                </Button>
              ) : (
                <>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleSendCode}
                      disabled={isVerifying}
                    >
                      Gửi lại mã
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleVerify}
                      disabled={isVerifying || verificationCode.length !== 6}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xác thực...
                        </>
                      ) : (
                        "Xác thực & Ký"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold">Ký số thành công!</h3>
            <p className="text-muted-foreground">
              Tài liệu đã được ký số thành công với chứng thư số của bạn.
            </p>
            {(signingReason || location) && (
              <div className="text-left p-4 bg-muted/30 rounded-lg max-w-md mx-auto">
                {signingReason && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Lý do ký:</span>
                    <p className="font-medium">{signingReason}</p>
                  </div>
                )}
                {location && (
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground">Địa điểm:</span>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </p>
                  </div>
                )}
              </div>
            )}
            <Button onClick={handleClose} className="mt-4">
              Đóng
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && step !== 3 && (
          <>
            <Separator />
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  step === 1 ? handleClose() : setStep((s) => (s - 1) as any)
                }
              >
                {step === 1 ? "Hủy" : "Quay lại"}
              </Button>
              {step !== 4 && (
                <Button
                  onClick={() => setStep((s) => (s + 1) as any)}
                  disabled={!canProceed()}
                >
                  Tiếp tục
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
