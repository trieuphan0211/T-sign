import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const Activity = () => {
  const recentActivity = [
    { action: "Đăng nhập", time: "5 phút trước", device: "Chrome - Windows" },
    { action: "Ký tài liệu", time: "2 giờ trước", device: "Chrome - Windows" },
    { action: "Tải lên file", time: "1 ngày trước", device: "Safari - macOS" },
    { action: "Đăng nhập", time: "2 ngày trước", device: "Mobile - iOS" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Lịch sử hoạt động của tài khoản</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.device}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
