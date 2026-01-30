"use client";
import {
  Bell,
  Building2,
  ChevronDown,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const organizations = [
  { id: "1", name: "Công ty ABC", logo: "ABC" },
  { id: "2", name: "Chi nhánh Hà Nội", logo: "HN" },
  { id: "3", name: "Chi nhánh TP.HCM", logo: "HCM" },
];

const notifications = [
  {
    id: "1",
    title: "Tài liệu mới cần ký",
    message: "Hợp đồng lao động #2024-001",
    time: "5 phút trước",
    unread: true,
  },
  {
    id: "2",
    title: "Chứng thư sắp hết hạn",
    message: "Chứng thư số của bạn sẽ hết hạn trong 30 ngày",
    time: "1 giờ trước",
    unread: true,
  },
  {
    id: "3",
    title: "Ký thành công",
    message: "Tài liệu #2024-002 đã được ký hoàn tất",
    time: "2 giờ trước",
    unread: false,
  },
];

export function AppHeader() {
  const session = useSession();
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]);
  const unreadCount = notifications.filter((n) => n.unread).length;
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60 px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm tài liệu, người dùng..."
            className="w-full pl-10 bg-secondary/50 border-transparent focus:border-primary focus:bg-card"
          />
        </div>
      </div>

      {/* Organization Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {selectedOrg.logo}
            </div>
            <span className="hidden sm:inline-block font-medium">
              {selectedOrg.name}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Chọn tổ chức</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => setSelectedOrg(org)}
              className="gap-3"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {org.logo}
              </div>
              <span>{org.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-3 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Quản lý tổ chức</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Thông báo</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} mới
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <div className="flex w-full items-start gap-2">
                  {notif.unread && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.time}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-primary">
            Xem tất cả thông báo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                NT
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium">{session.data?.user?.name}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-3">
            <User className="h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-3">
            <Settings className="h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-3 text-destructive focus:text-destructive">
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
