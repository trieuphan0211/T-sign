"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Building2, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export const Info = ({
  profile,
  setProfile,
}: {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    department: string;
    position: string;
    address: string;
    joinDate: string;
  };
  setProfile: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
      organization: string;
      department: string;
      position: string;
      address: string;
      joinDate: string;
    }>
  >;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Đã lưu thông tin hồ sơ");
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin hồ sơ của bạn</CardDescription>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </>
          ) : (
            "Chỉnh sửa"
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                className="pl-10"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                className="pl-10"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Tổ chức</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="organization"
                className="pl-10"
                value={profile.organization}
                onChange={(e) =>
                  setProfile({ ...profile, organization: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Phòng ban</Label>
            <Input
              id="department"
              value={profile.department}
              onChange={(e) =>
                setProfile({ ...profile, department: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Chức vụ</Label>
            <Input
              id="position"
              value={profile.position}
              onChange={(e) =>
                setProfile({ ...profile, position: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Địa chỉ</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="address"
              className="pl-10"
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
