"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Eye, EyeOff, Key } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";

export const Security = () => {
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    emailNotifications: true,
    loginAlerts: true,
    sessionTimeout: 30,
  });
  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    toast.success("Đã đổi mật khẩu thành công");
    setPasswords({ current: "", new: "", confirm: "" });
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>
            Đảm bảo tài khoản của bạn được bảo vệ an toàn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                className="pl-10 pr-10"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  className="pr-10"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </div>
          </div>

          <Button onClick={handleChangePassword}>Đổi mật khẩu</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt bảo mật</CardTitle>
          <CardDescription>
            Quản lý các tùy chọn bảo mật tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Xác thực hai lớp (2FA)</Label>
              <p className="text-sm text-muted-foreground">
                Thêm lớp bảo vệ cho tài khoản
              </p>
            </div>
            <Switch
              checked={securitySettings.twoFactor}
              onCheckedChange={(checked) =>
                setSecuritySettings({ ...securitySettings, twoFactor: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thông báo qua email</Label>
              <p className="text-sm text-muted-foreground">
                Nhận email khi có hoạt động quan trọng
              </p>
            </div>
            <Switch
              checked={securitySettings.emailNotifications}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  emailNotifications: checked,
                })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cảnh báo đăng nhập</Label>
              <p className="text-sm text-muted-foreground">
                Thông báo khi có đăng nhập từ thiết bị mới
              </p>
            </div>
            <Switch
              checked={securitySettings.loginAlerts}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  loginAlerts: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
