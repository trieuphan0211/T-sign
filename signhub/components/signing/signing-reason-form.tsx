import { useState } from "react";
import { MapPin, FileText, ScanFace, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SigningReasonFormProps {
  signingReason: string;
  onSigningReasonChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  requireEKYC?: boolean;
  onRequireEKYCChange?: (value: boolean) => void;
  showEKYCOption?: boolean;
}

const predefinedReasons = [
  { value: "approval", label: "Tôi đồng ý và phê duyệt nội dung tài liệu này" },
  { value: "review", label: "Tôi đã xem xét và xác nhận thông tin chính xác" },
  { value: "witness", label: "Tôi ký với tư cách là nhân chứng" },
  { value: "contract", label: "Tôi đồng ý với các điều khoản trong hợp đồng" },
  { value: "authorization", label: "Tôi ủy quyền theo nội dung văn bản" },
  { value: "custom", label: "Nhập lý do khác..." },
];

const commonLocations = [
  "Hà Nội, Việt Nam",
  "TP. Hồ Chí Minh, Việt Nam",
  "Đà Nẵng, Việt Nam",
  "Hải Phòng, Việt Nam",
  "Cần Thơ, Việt Nam",
];

export function SigningReasonForm({
  signingReason,
  onSigningReasonChange,
  location,
  onLocationChange,
  requireEKYC = false,
  onRequireEKYCChange,
  showEKYCOption = false,
}: SigningReasonFormProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isCustomReason, setIsCustomReason] = useState(false);

  const handleReasonSelect = (value: string) => {
    setSelectedReason(value);
    if (value === "custom") {
      setIsCustomReason(true);
      onSigningReasonChange("");
    } else {
      setIsCustomReason(false);
      const reason = predefinedReasons.find((r) => r.value === value);
      if (reason) {
        onSigningReasonChange(reason.label);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lý do ký (Signing Reason)
          </CardTitle>
          <CardDescription>
            Theo chuẩn eIDAS và pháp luật Việt Nam, mỗi chữ ký cần gắn với mục
            đích rõ ràng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Chọn lý do ký *</Label>
            <Select value={selectedReason} onValueChange={handleReasonSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do ký tài liệu" />
              </SelectTrigger>
              <SelectContent>
                {predefinedReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustomReason && (
            <div className="space-y-2">
              <Label>Nhập lý do ký *</Label>
              <Textarea
                placeholder="Nhập lý do ký của bạn..."
                value={signingReason}
                onChange={(e) => onSigningReasonChange(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {signingReason && !isCustomReason && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Lý do đã chọn:</p>
              <p className="text-sm font-medium mt-1">{signingReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Địa điểm ký (Location)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Địa điểm ký *</Label>
            <Input
              placeholder="VD: Hà Nội, Việt Nam"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {commonLocations.map((loc) => (
              <Badge
                key={loc}
                variant={location === loc ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onLocationChange(loc)}
              >
                {loc}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {showEKYCOption && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ScanFace className="h-4 w-4" />
              Xác thực nâng cao (eKYC)
              <Badge variant="secondary">Tùy chọn</Badge>
            </CardTitle>
            <CardDescription>
              Yêu cầu xác thực danh tính qua CCCD/FaceID trước khi ký
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Checkbox
                id="ekyc"
                checked={requireEKYC}
                onCheckedChange={(checked) => onRequireEKYCChange?.(!!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="ekyc" className="cursor-pointer">
                  Yêu cầu eKYC trước khi ký
                </Label>
                <p className="text-xs text-muted-foreground">
                  Người ký sẽ cần chụp CCCD và xác thực khuôn mặt để hoàn tất ký
                  số
                </p>
              </div>
            </div>

            {requireEKYC && (
              <div className="mt-4 p-3 bg-warning/10 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-warning">
                  eKYC sẽ được yêu cầu khi người dùng bắt đầu quy trình ký
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
