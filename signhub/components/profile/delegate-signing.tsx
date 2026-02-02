"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Plus,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";

interface Delegation {
  id: string;
  delegator: { name: string; email: string };
  delegate: { name: string; email: string };
  startDate: string;
  endDate: string;
  scope: "all" | "specific";
  documentTypes?: string[];
  isActive: boolean;
}

const mockDelegations: Delegation[] = [
  {
    id: "1",
    delegator: { name: "Nguyễn Văn A", email: "nguyenvana@company.com" },
    delegate: { name: "Trần Thị B", email: "tranthib@company.com" },
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    scope: "specific",
    documentTypes: ["Hợp đồng", "Báo cáo"],
    isActive: true,
  },
  {
    id: "2",
    delegator: { name: "Lê Văn C", email: "levanc@company.com" },
    delegate: { name: "Phạm D", email: "phamd@company.com" },
    startDate: "2024-03-10",
    endDate: "2024-03-15",
    scope: "all",
    isActive: false,
  },
];

const mockUsers = [
  { id: "1", name: "Trần Thị B", email: "tranthib@company.com" },
  { id: "2", name: "Phạm D", email: "phamd@company.com" },
  { id: "3", name: "Hoàng E", email: "hoange@company.com" },
];
export const DelegateSigning = () => {
  const [delegations, setDelegations] = useState(mockDelegations);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDelegation, setNewDelegation] = useState({
    delegateId: "",
    startDate: "",
    endDate: "",
    scope: "all" as "all" | "specific",
  });

  const handleCreate = () => {
    if (
      !newDelegation.delegateId ||
      !newDelegation.startDate ||
      !newDelegation.endDate
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const delegate = mockUsers.find((u) => u.id === newDelegation.delegateId);
    if (!delegate) return;

    const newItem: Delegation = {
      id: Date.now().toString(),
      delegator: { name: "Bạn", email: "you@company.com" },
      delegate: { name: delegate.name, email: delegate.email },
      startDate: newDelegation.startDate,
      endDate: newDelegation.endDate,
      scope: newDelegation.scope,
      isActive: true,
    };

    setDelegations([...delegations, newItem]);
    setIsCreateOpen(false);
    setNewDelegation({
      delegateId: "",
      startDate: "",
      endDate: "",
      scope: "all",
    });
    toast.success("Đã tạo ủy quyền ký thành công");
  };

  const toggleDelegation = (id: string) => {
    setDelegations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)),
    );
    const delegation = delegations.find((d) => d.id === id);
    toast.success(
      `Đã ${delegation?.isActive ? "tắt" : "bật"} ủy quyền cho ${delegation?.delegate.name}`,
    );
  };

  const deleteDelegation = (id: string) => {
    setDelegations((prev) => prev.filter((d) => d.id !== id));
    toast.success("Đã xóa ủy quyền");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Ủy quyền ký (Delegate Signing)</CardTitle>
              <CardDescription>
                Cho phép người khác ký thay trong thời gian bạn vắng mặt
              </CardDescription>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tạo ủy quyền
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo ủy quyền ký mới</DialogTitle>
                <DialogDescription>
                  Chọn người nhận ủy quyền và thời gian hiệu lực
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Người nhận ủy quyền *</Label>
                  <Select
                    value={newDelegation.delegateId}
                    onValueChange={(v) =>
                      setNewDelegation({ ...newDelegation, delegateId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn người nhận ủy quyền" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu *</Label>
                    <Input
                      type="date"
                      value={newDelegation.startDate}
                      onChange={(e) =>
                        setNewDelegation({
                          ...newDelegation,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc *</Label>
                    <Input
                      type="date"
                      value={newDelegation.endDate}
                      onChange={(e) =>
                        setNewDelegation({
                          ...newDelegation,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phạm vi ủy quyền</Label>
                  <Select
                    value={newDelegation.scope}
                    onValueChange={(v) =>
                      setNewDelegation({
                        ...newDelegation,
                        scope: v as "all" | "specific",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả tài liệu</SelectItem>
                      <SelectItem value="specific">
                        Loại tài liệu cụ thể
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-warning/10 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-warning">
                    Người được ủy quyền sẽ có thể ký thay bạn với chữ ký điện tử
                    của họ. Chữ ký sẽ ghi chú &quot;Ký thay theo ủy quyền&quot;.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreate}>Tạo ủy quyền</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {delegations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Chưa có ủy quyền nào</p>
            <p className="text-sm">
              Tạo ủy quyền để cho phép người khác ký thay bạn
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {delegations.map((delegation) => (
              <div
                key={delegation.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{delegation.delegate.name}</p>
                    {delegation.isActive ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Đã tắt</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {delegation.delegate.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(delegation.startDate).toLocaleDateString(
                        "vi-VN",
                      )}{" "}
                      -{" "}
                      {new Date(delegation.endDate).toLocaleDateString("vi-VN")}
                    </span>
                    {delegation.scope === "specific" &&
                      delegation.documentTypes && (
                        <>
                          <span>•</span>
                          <span>{delegation.documentTypes.join(", ")}</span>
                        </>
                      )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={delegation.isActive}
                    onCheckedChange={() => toggleDelegation(delegation.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteDelegation(delegation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
