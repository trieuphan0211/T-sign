import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
} from "lucide-react";

interface WorkflowDeadlineSettingsProps {
  deadlineDays: number;
  onDeadlineDaysChange: (days: number) => void;
  enableReminders: boolean;
  onEnableRemindersChange: (enabled: boolean) => void;
  reminderIntervals: number[];
  onReminderIntervalsChange: (intervals: number[]) => void;
  autoExpire: boolean;
  onAutoExpireChange: (enabled: boolean) => void;
  notificationChannels: ("email" | "sms" | "push")[];
  onNotificationChannelsChange: (
    channels: ("email" | "sms" | "push")[],
  ) => void;
}

const reminderOptions = [
  { value: 1, label: "1 giờ trước" },
  { value: 4, label: "4 giờ trước" },
  { value: 24, label: "1 ngày trước" },
  { value: 48, label: "2 ngày trước" },
  { value: 72, label: "3 ngày trước" },
  { value: 168, label: "1 tuần trước" },
];

export function WorkflowDeadlineSettings({
  deadlineDays,
  onDeadlineDaysChange,
  enableReminders,
  onEnableRemindersChange,
  reminderIntervals,
  onReminderIntervalsChange,
  autoExpire,
  onAutoExpireChange,
  notificationChannels,
  onNotificationChannelsChange,
}: WorkflowDeadlineSettingsProps) {
  const toggleReminderInterval = (hours: number) => {
    if (reminderIntervals.includes(hours)) {
      onReminderIntervalsChange(reminderIntervals.filter((h) => h !== hours));
    } else {
      onReminderIntervalsChange(
        [...reminderIntervals, hours].sort((a, b) => a - b),
      );
    }
  };

  const toggleChannel = (channel: "email" | "sms" | "push") => {
    if (notificationChannels.includes(channel)) {
      onNotificationChannelsChange(
        notificationChannels.filter((c) => c !== channel),
      );
    } else {
      onNotificationChannelsChange([...notificationChannels, channel]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Deadline Setting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hạn chót ký (Deadline)
          </CardTitle>
          <CardDescription>
            Thời gian tối đa để người nhận hoàn tất ký tài liệu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label>Số ngày hạn chót</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={deadlineDays}
                  onChange={(e) =>
                    onDeadlineDaysChange(parseInt(e.target.value) || 7)
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  ngày kể từ khi gửi
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoExpire}
                onCheckedChange={onAutoExpireChange}
              />
              <Label className="cursor-pointer">Tự động hết hạn</Label>
            </div>
          </div>

          {autoExpire && (
            <div className="p-3 bg-warning/10 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div className="text-sm text-warning">
                <p className="font-medium">Tài liệu sẽ tự động hết hạn</p>
                <p>
                  Sau {deadlineDays} ngày, tài liệu chưa được ký sẽ chuyển sang
                  trạng thái &quot;Expired&quot; và không thể ký được nữa.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Nhắc nhở tự động
              </CardTitle>
              <CardDescription>
                Gửi email/SMS nhắc nhở nếu người nhận chưa ký
              </CardDescription>
            </div>
            <Switch
              checked={enableReminders}
              onCheckedChange={onEnableRemindersChange}
            />
          </div>
        </CardHeader>
        {enableReminders && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Thời điểm nhắc nhở</Label>
              <div className="flex flex-wrap gap-2">
                {reminderOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      reminderIntervals.includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleReminderInterval(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kênh thông báo</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email-notify"
                    checked={notificationChannels.includes("email")}
                    onCheckedChange={() => toggleChannel("email")}
                  />
                  <Label
                    htmlFor="email-notify"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sms-notify"
                    checked={notificationChannels.includes("sms")}
                    onCheckedChange={() => toggleChannel("sms")}
                  />
                  <Label
                    htmlFor="sms-notify"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="push-notify"
                    checked={notificationChannels.includes("push")}
                    onCheckedChange={() => toggleChannel("push")}
                  />
                  <Label
                    htmlFor="push-notify"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Bell className="h-4 w-4" />
                    Push notification
                  </Label>
                </div>
              </div>
            </div>

            {reminderIntervals.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Lịch nhắc nhở:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {reminderIntervals.map((hours) => {
                    const option = reminderOptions.find(
                      (o) => o.value === hours,
                    );
                    return (
                      <li key={hours} className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {option?.label} hạn chót
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
