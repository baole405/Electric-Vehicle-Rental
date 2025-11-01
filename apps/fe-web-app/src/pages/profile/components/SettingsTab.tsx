import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";
import { useUserHook } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Save, Lock, User as UserIcon, Mail, Phone } from "lucide-react";
import { ROUTES } from "@/routes/route.constants";

export default function SettingsTab() {
  const navigate = useNavigate();
  const { currentUser, clearAuth } = useAuthContext();
  const { updateUser, changePassword } = useUserHook();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = () => {
    if (!currentUser?._id) return;

    updateUser.mutate(
      {
        id: currentUser._id,
        payload: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
        },
      },
      {
        onSuccess: () => {
          alert("Cập nhật thông tin thành công!");
          setIsEditing(false);
          // Reload page để refresh user data từ token
          window.location.reload();
        },
        onError: (error) => {
          console.error("Update profile error:", error);
          alert("Không thể cập nhật thông tin. Vui lòng thử lại!");
        },
      }
    );
  };

  const handleChangePassword = () => {
    if (!currentUser?._id) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    changePassword.mutate(
      {
        id: currentUser._id,
        payload: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      },
      {
        onSuccess: () => {
          alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
          // Đăng xuất và chuyển về trang đăng nhập
          setTimeout(() => {
            clearAuth();
            navigate(ROUTES.LOGIN);
          }, 1000);
        },
        onError: (error) => {
          console.error("Change password error:", error);
          alert("Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại!");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <UserIcon className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveProfile} disabled={updateUser.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateUser.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={updateUser.isPending}>
                Hủy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={handleChangePassword} disabled={changePassword.isPending}>
            <Lock className="w-4 h-4 mr-2" />
            {changePassword.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
