"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    agreeTerms: false,
  });
  function handleRegister() {}
  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="fullName"
            placeholder="Nguyễn Văn A"
            className="pl-10"
            value={registerForm.fullName}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, fullName: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="email@example.com"
            className="pl-10"
            value={registerForm.email}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, email: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Tổ chức (tùy chọn)</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="organization"
            placeholder="Tên công ty"
            className="pl-10"
            value={registerForm.organization}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, organization: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="register-password">Mật khẩu</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            value={registerForm.password}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, password: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Xác nhận</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={registerForm.confirmPassword}
            onChange={(e) =>
              setRegisterForm({
                ...registerForm,
                confirmPassword: e.target.value,
              })
            }
            required
          />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={registerForm.agreeTerms}
          onCheckedChange={(checked) =>
            setRegisterForm({ ...registerForm, agreeTerms: checked as boolean })
          }
        />
        <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
          Tôi đồng ý với{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Điều khoản sử dụng
          </Link>{" "}
          và{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Chính sách bảo mật
          </Link>
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
      </Button>
    </form>
  );
};
