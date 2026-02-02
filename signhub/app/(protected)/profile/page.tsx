"use client";
import { Activity } from "@/components/profile/activity";
import { DelegateSigning } from "@/components/profile/delegate-signing";
import { Info } from "@/components/profile/info";
import { Security } from "@/components/profile/security";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  Camera,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@company.com",
    phone: "0901234567",
    organization: "Công ty TNHH ABC",
    department: "Phòng Pháp chế",
    position: "Trưởng phòng",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    joinDate: "2024-01-15",
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và cài đặt bảo mật
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {profile.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="text-xl font-semibold mt-4">{profile.fullName}</h2>
              <p className="text-muted-foreground">{profile.position}</p>
              <Badge className="mt-2" variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Đã xác minh
              </Badge>

              <Separator className="my-4" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.organization}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Tham gia:{" "}
                    {new Date(profile.joinDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="delegate">Ủy quyền ký</TabsTrigger>
              <TabsTrigger value="security">Bảo mật</TabsTrigger>
              <TabsTrigger value="activity">Hoạt động</TabsTrigger>
            </TabsList>
            {/* Info Tab */}
            <TabsContent value="info">
              <Info profile={profile} setProfile={setProfile} />
            </TabsContent>
            {/* Delegate Signing Tab */}
            <TabsContent value="delegate">
              <DelegateSigning />
            </TabsContent>
            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Security />
            </TabsContent>
            {/* Activity Tab */}
            <TabsContent value="activity">
              <Activity />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
