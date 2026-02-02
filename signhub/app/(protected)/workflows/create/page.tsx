"use client";
import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  User,
  Mail,
  ArrowRight,
  Save,
  X,
  ArrowDownUp,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WorkflowDeadlineSettings } from "@/components/workflow/workflow-deadline-settings";

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
}

export default function WorkflowCreate() {
  const router = useRouter();
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [signingType, setSigningType] = useState("sequential");
  const [signers, setSigners] = useState<Signer[]>([
    { id: "1", name: "", email: "", role: "signer", order: 1 },
  ]);

  // Deadline and reminder settings
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderIntervals, setReminderIntervals] = useState<number[]>([
    24, 48,
  ]);
  const [autoExpire, setAutoExpire] = useState(true);
  const [notificationChannels, setNotificationChannels] = useState<
    ("email" | "sms" | "push")[]
  >(["email"]);

  // eKYC option
  const [requireEKYC, setRequireEKYC] = useState(false);

  const addSigner = () => {
    const newSigner: Signer = {
      id: Date.now().toString(),
      name: "",
      email: "",
      role: "signer",
      order: signers.length + 1,
    };
    setSigners([...signers, newSigner]);
  };

  const removeSigner = (id: string) => {
    if (signers.length > 1) {
      setSigners(signers.filter((s) => s.id !== id));
    }
  };

  const updateSigner = (id: string, field: keyof Signer, value: string) => {
    setSigners(
      signers.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleSave = () => {
    if (!workflowName.trim()) {
      toast("Lỗi", {
        description: "Vui lòng nhập tên luồng công việc",
      });
      return;
    }

    toast("Thành công", {
      description: "Đã tạo luồng công việc mới",
    });
    router.push("/workflows");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tạo luồng mới</h1>
          <p className="text-muted-foreground mt-1">
            Thiết lập quy trình ký số tự động
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/workflows")}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Lưu luồng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin luồng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên luồng công việc *</Label>
              <Input
                id="name"
                placeholder="VD: Phê duyệt hợp đồng mua bán"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về luồng công việc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Parallel vs Sequential Signing */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Kiểu ký số</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${signingType === "sequential" ? "border-primary ring-2 ring-primary/20" : "hover:border-muted-foreground/30"}`}
                  onClick={() => setSigningType("sequential")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${signingType === "sequential" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <ArrowDownUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Tuần tự (Sequential)</p>
                        <p className="text-xs text-muted-foreground">
                          A ký xong → B ký → C ký
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${signingType === "parallel" ? "border-primary ring-2 ring-primary/20" : "hover:border-muted-foreground/30"}`}
                  onClick={() => setSigningType("parallel")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${signingType === "parallel" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Song song (Parallel)</p>
                        <p className="text-xs text-muted-foreground">
                          A, B, C ký cùng lúc
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <p className="text-sm text-muted-foreground">
                {signingType === "sequential"
                  ? "Người ký sẽ ký theo thứ tự được sắp xếp. Chỉ khi người trước ký xong, người sau mới nhận được thông báo."
                  : "Tất cả người ký sẽ nhận thông báo cùng lúc và có thể ký song song."}
              </p>
            </div>

            <Separator />

            {/* eKYC Option */}
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">Yêu cầu eKYC trước khi ký</p>
                      <p className="text-xs text-muted-foreground">
                        Người ký phải xác thực CCCD/FaceID trước khi ký
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={requireEKYC}
                    onCheckedChange={setRequireEKYC}
                  />
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Xem trước luồng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signers.map((signer, index) => (
                <div key={signer.id} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-sm">
                    {signer.name || "Người ký " + (index + 1)}
                  </div>
                  {index < signers.length - 1 &&
                    signingType === "sequential" && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <Badge
                variant={signingType === "sequential" ? "default" : "secondary"}
              >
                {signingType === "sequential" ? "Ký tuần tự" : "Ký song song"}
              </Badge>
              {requireEKYC && (
                <Badge variant="outline" className="ml-2">
                  Yêu cầu eKYC
                </Badge>
              )}
              <p className="text-xs text-muted-foreground">
                Hạn chót: {deadlineDays} ngày
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deadline and Reminder Settings */}
      <WorkflowDeadlineSettings
        deadlineDays={deadlineDays}
        onDeadlineDaysChange={setDeadlineDays}
        enableReminders={enableReminders}
        onEnableRemindersChange={setEnableReminders}
        reminderIntervals={reminderIntervals}
        onReminderIntervalsChange={setReminderIntervals}
        autoExpire={autoExpire}
        onAutoExpireChange={setAutoExpire}
        notificationChannels={notificationChannels}
        onNotificationChannelsChange={setNotificationChannels}
      />

      {/* Signers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách người ký</CardTitle>
          <Button size="sm" onClick={addSigner}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm người ký
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signers.map((signer, index) => (
              <div
                key={signer.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2 pt-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Họ tên
                    </Label>
                    <Input
                      placeholder="Nguyễn Văn A"
                      value={signer.name}
                      onChange={(e) =>
                        updateSigner(signer.id, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      value={signer.email}
                      onChange={(e) =>
                        updateSigner(signer.id, "email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vai trò</Label>
                    <Select
                      value={signer.role}
                      onValueChange={(value) =>
                        updateSigner(signer.id, "role", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="signer">Người ký</SelectItem>
                        <SelectItem value="approver">
                          Người phê duyệt
                        </SelectItem>
                        <SelectItem value="viewer">Người xem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeSigner(signer.id)}
                  disabled={signers.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
