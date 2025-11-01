import { useAuthContext } from "@/contexts/auth-context";
import { useBooking } from "@/hooks/use-booking";
import { useUserDocument } from "@/hooks/use-user-document";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import {
    Calendar,
    DollarSign,
    Car,
    CheckCircle2,
    Clock,
    XCircle,
    FileCheck,
    FileX,
    ArrowRight,
    TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import type { TBooking } from "@/schema/booking.schema";
import type { TUserDocument } from "@/schema/user-document.schema";

interface OverviewTabProps {
    onTabChange?: (tab: string) => void;
}

export default function OverviewTab({ onTabChange }: OverviewTabProps) {
    const { currentUser } = useAuthContext();
    const navigate = useNavigate();

    // Fetch bookings
    const { useBookingList } = useBooking();
    const bookingListQuery = useBookingList();
    const bookings = useMemo(
        () => (bookingListQuery.data?.data?.data || []) as TBooking[],
        [bookingListQuery.data?.data?.data]
    );

    // Fetch documents
    const userDocumentsQuery = useUserDocument(currentUser?._id);
    const documents = useMemo(
        () => (userDocumentsQuery.data?.data?.data || []) as TUserDocument[],
        [userDocumentsQuery.data?.data?.data]
    );

    // Calculate stats
    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const activeBookings = bookings.filter((b) => b.status === "confirmed").length;
        const pendingBookings = bookings.filter((b) => b.status === "pending_payment").length;
        const completedBookings = bookings.filter((b) => b.status === "completed").length;
        const totalSpent = bookings
            .filter((b) => b.status !== "cancelled")
            .reduce((sum, b) => sum + (b.totalPayable || 0), 0);

        return {
            totalBookings,
            activeBookings,
            pendingBookings,
            completedBookings,
            totalSpent,
        };
    }, [bookings]);

    // Document stats
    const docStats = useMemo(() => {
        const verified = documents.filter((d) => d.status === "verified").length;
        const pending = documents.filter((d) => d.status === "pending").length;
        const rejected = documents.filter((d) => d.status === "rejected").length;

        return { verified, pending, rejected, total: documents.length };
    }, [documents]);

    // Recent bookings (last 3)
    const recentBookings = useMemo(() => {
        return bookings
            .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
            .slice(0, 3);
    }, [bookings]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string; icon: typeof Clock }> = {
            pending_payment: { label: "Chờ thanh toán", className: "bg-yellow-100 text-yellow-800", icon: Clock },
            confirmed: { label: "Đã xác nhận", className: "bg-green-100 text-green-800", icon: CheckCircle2 },
            completed: { label: "Hoàn thành", className: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
            cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800", icon: XCircle },
        };

        const variant = variants[status] || { label: status, className: "bg-gray-100 text-gray-800", icon: Clock };
        const Icon = variant.icon;

        return (
            <Badge className={`${variant.className} border-0`}>
                <Icon className="w-3 h-3 mr-1" />
                {variant.label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng booking</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</h3>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                                <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.activeBookings}</h3>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <Car className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                                <h3 className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingBookings}</h3>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                                <h3 className="text-2xl font-bold text-purple-600 mt-1">
                                    {stats.totalSpent.toLocaleString("vi-VN")}đ
                                </h3>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Booking gần đây</CardTitle>
                                <CardDescription>3 booking mới nhất của bạn</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => onTabChange?.("bookings")}
                                size="sm"
                            >
                                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {bookingListQuery.isLoading ? (
                            <p className="text-center text-gray-500 py-8">Đang tải...</p>
                        ) : recentBookings.length === 0 ? (
                            <div className="text-center py-8">
                                <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Chưa có booking nào</p>
                                <Button className="mt-4" onClick={() => navigate("/")}>
                                    Đặt xe ngay
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentBookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/bookings/${booking._id}`)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-900">{booking.bookingCode}</h4>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {booking.brand?.name || "N/A"} • {booking.pickupDate} - {booking.returnDate}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">
                                                {booking.totalPayable?.toLocaleString("vi-VN")}đ
                                            </p>
                                            <p className="text-xs text-gray-500">{booking.rentalDays} ngày</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Document Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trạng thái hồ sơ</CardTitle>
                        <CardDescription>Giấy tờ của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-green-900">Đã duyệt</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">{docStats.verified}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-900">Chờ duyệt</span>
                                </div>
                                <span className="text-2xl font-bold text-yellow-600">{docStats.pending}</span>
                            </div>

                            {docStats.rejected > 0 && (
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileX className="w-5 h-5 text-red-600" />
                                        <span className="font-medium text-red-900">Bị từ chối</span>
                                    </div>
                                    <span className="text-2xl font-bold text-red-600">{docStats.rejected}</span>
                                </div>
                            )}
                        </div>

                        {currentUser?.status === "pending_documents" && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800 mb-2">
                                    <span role="img" aria-label="warning">⚠️</span> Bạn cần nộp đầy đủ hồ sơ để được xác minh
                                </p>
                                <Button size="sm" onClick={() => onTabChange?.("documents")} className="w-full">
                                    Nộp hồ sơ ngay
                                </Button>
                            </div>
                        )}

                        <Button variant="outline" className="w-full" onClick={() => onTabChange?.("documents")}>
                            Quản lý hồ sơ
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <CardTitle>Hoạt động của bạn</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.completedBookings}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Tổng ngày thuê</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {bookings.reduce((sum, b) => sum + (b.rentalDays || 0), 0)}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Xe đã thuê</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {new Set(bookings.map((b) => b.brand?._id)).size}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Điểm trung bình</p>
                            <p className="text-3xl font-bold text-yellow-600">5.0</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
