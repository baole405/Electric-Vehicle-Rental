import { useUserDocument } from "@/hooks/use-user-document";
import { useAuthContext } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
    FileText,
    Upload,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Download,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { TUserDocument } from "@/schema/user-document.schema";

export default function DocumentsTab() {
    const { currentUser } = useAuthContext();
    const userDocumentsQuery = useUserDocument(currentUser?._id);
    const { submitDocument } = useUserDocument(currentUser?._id);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploadData, setUploadData] = useState({
        documentType: "national_id",
        identityNumber: "",
        drivingLicenseNumber: "",
        frontImage: null as File | null,
        backImage: null as File | null,
        drivingLicenseImage: null as File | null,
    });

    const documents = useMemo(
        () => (userDocumentsQuery.data?.data?.data || []) as TUserDocument[],
        [userDocumentsQuery.data?.data?.data]
    );

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
            verified: { label: "Đã duyệt", className: "bg-green-500", icon: CheckCircle2 },
            pending: { label: "Chờ duyệt", className: "bg-yellow-500", icon: Clock },
            under_review: { label: "Đang xem xét", className: "bg-blue-500", icon: Clock },
            rejected: { label: "Bị từ chối", className: "bg-red-500", icon: XCircle },
        };

        const variant = config[status] || { label: status, className: "bg-gray-500", icon: Clock };
        const Icon = variant.icon;

        return (
            <Badge className={`${variant.className} text-white`}>
                <Icon className="w-3 h-3 mr-1" />
                {variant.label}
            </Badge>
        );
    };

    const getDocumentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            id_card: "CCCD/CMND",
            driver_license: "Giấy phép lái xe",
            passport: "Hộ chiếu",
            other: "Khác",
        };
        return labels[type] || type;
    };

    const handleFileChange = (field: 'frontImage' | 'backImage' | 'drivingLicenseImage') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("File không được lớn hơn 5MB!");
                return;
            }
            // Check file type
            const validTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!validTypes.includes(file.type)) {
                alert("Chỉ chấp nhận file JPG hoặc PNG!");
                return;
            }
            setUploadData({ ...uploadData, [field]: file });
        }
    };

    const handleUploadSubmit = () => {
        if (!currentUser?._id) return;

        if (!uploadData.identityNumber || !uploadData.drivingLicenseNumber ||
            !uploadData.frontImage || !uploadData.backImage || !uploadData.drivingLicenseImage) {
            alert("Vui lòng điền đầy đủ thông tin và upload đủ 3 ảnh!");
            return;
        }

        const payload = {
            user: currentUser._id,
            documentType: uploadData.documentType,
            identityNumber: uploadData.identityNumber,
            drivingLicenseNumber: uploadData.drivingLicenseNumber,
            frontImage: uploadData.frontImage,
            backImage: uploadData.backImage,
            drivingLicenseImage: uploadData.drivingLicenseImage,
        };

        submitDocument.mutate(payload, {
            onSuccess: () => {
                alert("Tải lên giấy tờ thành công! Vui lòng đợi xác minh.");
                setShowUploadDialog(false);
                setUploadData({
                    documentType: "national_id",
                    identityNumber: "",
                    drivingLicenseNumber: "",
                    frontImage: null,
                    backImage: null,
                    drivingLicenseImage: null,
                });
                userDocumentsQuery.refetch();
            },
            onError: (error) => {
                console.error("Upload document error:", error);
                alert("Không thể tải lên giấy tờ. Vui lòng thử lại!");
            },
        });
    }; return (
        <div className="space-y-6">
            {currentUser?.status === "pending_documents" && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">
                                    Hoàn thiện hồ sơ để được xác minh
                                </h3>
                                <p className="text-sm text-blue-700 mb-4">
                                    Vui lòng nộp đầy đủ CCCD/CMND và Giấy phép lái xe để được xác minh tài khoản và thuê xe.
                                </p>
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowUploadDialog(true)}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Tải lên giấy tờ
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Giấy tờ của tôi</CardTitle>
                            <CardDescription>Quản lý các giấy tờ cá nhân</CardDescription>
                        </div>
                        <Button onClick={() => setShowUploadDialog(true)}>
                            <Upload className="w-4 h-4 mr-2" />
                            Thêm giấy tờ
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {userDocumentsQuery.isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-gray-500 mt-4">Đang tải...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">Chưa có giấy tờ nào</p>
                            <p className="text-sm text-gray-400 mb-4">
                                Nộp CCCD/CMND và GPLX để được xác minh
                            </p>
                            <Button onClick={() => setShowUploadDialog(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Tải lên giấy tờ
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.map((doc: TUserDocument) => (
                                <Card key={doc._id} className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-100 p-3 rounded-lg">
                                                    <FileText className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {getDocumentTypeLabel(doc.documentType)}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">{doc.identityNumber || "N/A"}</p>
                                                </div>
                                            </div>
                                            {getStatusBadge(doc.status)}
                                        </div>

                                        {doc.notes && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-red-800">
                                                    <strong>Lý do từ chối:</strong> {doc.notes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500 mb-4">
                                            <p>Ngày nộp: {new Date(doc.submittedAt).toLocaleDateString("vi-VN")}</p>
                                            {doc.updatedAt && doc.submittedAt !== doc.updatedAt && (
                                                <p>Ngày duyệt: {new Date(doc.updatedAt).toLocaleDateString("vi-VN")}</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="w-4 h-4 mr-1" />
                                                Xem
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Download className="w-4 h-4 mr-1" />
                                                Tải về
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Document Guidelines */}
            <Card>
                <CardHeader>
                    <CardTitle>Hướng dẫn nộp giấy tờ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium">Ảnh rõ nét, đầy đủ thông tin</p>
                                <p className="text-gray-600">Chụp toàn bộ giấy tờ, không bị mờ, tối</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium">File dung lượng nhỏ hơn 5MB</p>
                                <p className="text-gray-600">Định dạng: JPG, PNG, PDF</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium">Giấy tờ còn hiệu lực</p>
                                <p className="text-gray-600">Chưa hết hạn sử dụng</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tải lên giấy tờ</DialogTitle>
                        <DialogDescription>
                            Nộp CCCD/CMND hoặc Giấy phép lái xe để được xác minh tài khoản
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="identityNumber">Số CCCD/CMND *</Label>
                            <Input
                                id="identityNumber"
                                placeholder="Nhập số CCCD/CMND (12 số)"
                                value={uploadData.identityNumber}
                                onChange={(e) =>
                                    setUploadData({ ...uploadData, identityNumber: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="drivingLicenseNumber">Số GPLX *</Label>
                            <Input
                                id="drivingLicenseNumber"
                                placeholder="Nhập số Giấy phép lái xe"
                                value={uploadData.drivingLicenseNumber}
                                onChange={(e) =>
                                    setUploadData({ ...uploadData, drivingLicenseNumber: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="frontImage">Ảnh CCCD mặt trước *</Label>
                            <Input
                                id="frontImage"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleFileChange('frontImage')}
                            />
                            {uploadData.frontImage && (
                                <p className="text-sm text-green-600">✓ {uploadData.frontImage.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="backImage">Ảnh CCCD mặt sau *</Label>
                            <Input
                                id="backImage"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleFileChange('backImage')}
                            />
                            {uploadData.backImage && (
                                <p className="text-sm text-green-600">✓ {uploadData.backImage.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="drivingLicenseImage">Ảnh GPLX *</Label>
                            <Input
                                id="drivingLicenseImage"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleFileChange('drivingLicenseImage')}
                            />
                            {uploadData.drivingLicenseImage && (
                                <p className="text-sm text-green-600">✓ {uploadData.drivingLicenseImage.name}</p>
                            )}
                            <p className="text-xs text-gray-500">Chỉ chấp nhận JPG, PNG (tối đa 5MB/ảnh)</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleUploadSubmit} disabled={submitDocument.isPending}>
                            {submitDocument.isPending ? "Đang tải lên..." : "Tải lên"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
