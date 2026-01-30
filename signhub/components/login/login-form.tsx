"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  function handleLoginWithKeycloak() {
    signIn("keycloak", {
      redirectTo: "/",
    });
  }
  function handleForgotPassword() {}
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            placeholder="email@example.com"
            className="pl-10"
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Mật khẩu</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={loginForm.remember}
            onCheckedChange={(checked) =>
              setLoginForm({ ...loginForm, remember: checked as boolean })
            }
          />
          <Label htmlFor="remember" className="text-sm font-normal">
            Ghi nhớ đăng nhập
          </Label>
        </div>
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={handleForgotPassword}
        >
          Quên mật khẩu?
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
      {/* SSO Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Hoặc đăng nhập bằng
          </span>
        </div>
      </div>
      {/* Keycloak SSO Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleLoginWithKeycloak}
        disabled={isLoading}
      >
        <Key className="h-4 w-4" />
        Đăng nhập với Keycloak SSO
      </Button>
    </form>
  );
};
