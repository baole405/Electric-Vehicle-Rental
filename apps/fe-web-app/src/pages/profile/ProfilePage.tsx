import { useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/ui/avatar";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  User,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  Shield,
  LogOut,
  Mail,
  Phone
} from "lucide-react";
import OverviewTab from "./components/OverviewTab";
import BookingsTab from "./components/BookingsTab";
import PaymentsTab from "./components/PaymentsTab";
import DocumentsTab from "./components/DocumentsTab";
import SettingsTab from "./components/SettingsTab";
import HeaderMain from "@/components/header/header-main";

export default function ProfilePage() {
  const { currentUser, clearAuth } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  if (!currentUser) {
    navigate("/auth/login");
    return null;
  }

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (currentUser.status) {
      case "verified":
        return <Badge variant="default" className="bg-green-600"><Shield className="w-3 h-3 mr-1" />Đã xác minh</Badge>;
      case "active":
        return <Badge variant="default" className="bg-blue-600">Hoạt động</Badge>;
      case "documents_submitted":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "pending_documents":
        return <Badge variant="outline">Chưa nộp hồ sơ</Badge>;
      default:
        return <Badge variant="outline">{currentUser.status}</Badge>;
    }
  };

  // Get role label
  const getRoleLabel = () => {
    switch (currentUser.role) {
      case "renter":
        return "Khách hàng";
      case "staff":
        return "Nhân viên";
      case "admin":
        return "Quản trị viên";
      default:
        return currentUser.role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderMain />
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={undefined} alt={currentUser.fullName} />
              <AvatarFallback className="bg-green-800 text-white text-2xl font-bold">
                {getInitials(currentUser.fullName)}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{currentUser.fullName}</h1>
                {getStatusBadge()}
              </div>

              <div className="space-y-1 text-green-50">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {currentUser.email}
                </p>
                {currentUser.phone && (
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <Phone className="w-4 h-4" />
                    {currentUser.phone}
                  </p>
                )}
                <p className="text-sm">
                  {getRoleLabel()} • Tham gia{' '}
                  {new Date(currentUser.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setActiveTab('settings')}
                className="bg-white text-green-700 hover:bg-green-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-white text-green-700 hover:bg-green-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white shadow-sm h-auto p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 py-3"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex items-center gap-2 py-3"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Đặt xe</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center gap-2 py-3"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Thanh toán</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-2 py-3"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Hồ sơ</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 py-3"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Cài đặt</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab onTabChange={setActiveTab} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
