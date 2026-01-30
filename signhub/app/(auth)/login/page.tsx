import { LoginForm } from "@/components/login/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Shield } from "lucide-react";
import { RegisterForm } from "@/components/login/register-form";

export default function Login() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">SignHub</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Nền tảng ký số
              <br />
              <span className="text-primary">an toàn & hiệu quả</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Ký số tài liệu mọi lúc, mọi nơi. Tuân thủ tiêu chuẩn eIDAS/ETSI.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <ArrowRight className="h-4 w-4 text-success" />
              </div>
              <div>
                <h3 className="font-medium">Chữ ký số hợp pháp</h3>
                <p className="text-sm text-muted-foreground">
                  Giá trị pháp lý tương đương chữ ký tay
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <ArrowRight className="h-4 w-4 text-success" />
              </div>
              <div>
                <h3 className="font-medium">Bảo mật tối đa</h3>
                <p className="text-sm text-muted-foreground">
                  Mã hóa AES-256 và xác thực đa lớp
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <ArrowRight className="h-4 w-4 text-success" />
              </div>
              <div>
                <h3 className="font-medium">Dễ dàng tích hợp</h3>
                <p className="text-sm text-muted-foreground">
                  API RESTful và SDK đầy đủ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SignHub</span>
            </div>
            <CardTitle>Chào mừng bạn</CardTitle>
            <CardDescription>Đăng nhập hoặc tạo tài khoản mới</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>
              {/* Login Tab */}
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              {/* Register Tab */}
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
