"use client";

import { cn } from "@/lib/utils";
import {
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  HelpCircle,
  History,
  Key,
  LayoutDashboard,
  LogOut,
  PenTool,
  Settings,
  Shield,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Tổng quan",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Tài liệu",
    icon: FileText,
    children: [
      { title: "Tất cả tài liệu", href: "/documents" },
      { title: "Chờ tôi ký", href: "/documents/pending" },
      { title: "Đã ký", href: "/documents/signed" },
      { title: "Đã từ chối", href: "/documents/rejected" },
      { title: "Nháp", href: "/documents/drafts" },
    ],
  },
  {
    title: "Phòng ký",
    href: "/signing-room",
    icon: PenTool,
  },
  {
    title: "Luồng công việc",
    icon: Workflow,
    children: [
      { title: "Tất cả luồng", href: "/workflows" },
      { title: "Tạo luồng mới", href: "/workflows/create" },
      { title: "Mẫu luồng", href: "/workflows/templates" },
    ],
  },
  {
    title: "Xác minh",
    href: "/verify",
    icon: CheckCircle,
  },
  {
    title: "Chứng thư số",
    icon: Key,
    children: [
      { title: "Danh sách", href: "/certificates" },
      { title: "Thêm mới", href: "/certificates/add" },
    ],
  },
  {
    title: "Nhật ký",
    href: "/audit-logs",
    icon: History,
  },
];

const adminItems: NavItem[] = [
  {
    title: "Người dùng",
    icon: Users,
    children: [
      { title: "Danh sách", href: "/admin/users" },
      { title: "Phân quyền", href: "/admin/roles" },
    ],
  },
  {
    title: "Tổ chức",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    title: "Bảo mật",
    icon: Shield,
    children: [
      { title: "Cấu hình CA/TSA", href: "/settings/security/ca" },
      { title: "Chính sách ký", href: "/settings/security/policies" },
      { title: "Thuật toán", href: "/settings/security/algorithms" },
    ],
  },
  {
    title: "Cài đặt",
    icon: Settings,
    children: [
      { title: "Chung", href: "/settings/general" },
      { title: "Thông báo", href: "/settings/notifications" },
      { title: "Tích hợp API", href: "/settings/integrations" },
      { title: "Sao lưu", href: "/settings/backup" },
    ],
  },
];

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(
    item.children?.some((child) => pathname === child.href) ?? false,
  );

  const Icon = item.icon;

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isOpen && "bg-sidebar-accent/50",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">{item.title}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-1 pl-8">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-all",
                pathname === child.href || pathname.startsWith(`${child.href}/`)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              {child.title}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        pathname === item.href! || pathname.startsWith(`${item.href!}/`)
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{item.title}</span>
    </Link>
  );
}

export const AppSidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
          <PenTool className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">SignHub</h1>
          <p className="text-xs text-sidebar-muted">Digital Signing</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItemComponent key={item.title} item={item} />
          ))}
        </div>

        {/* Admin Section */}
        <div className="mt-6 pt-6 border-t border-sidebar-border">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
            Quản trị
          </p>
          <div className="space-y-1">
            {adminItems.map((item) => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Trợ giúp</span>
        </Link>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all">
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
