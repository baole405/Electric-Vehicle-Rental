import { useMemo, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useUserDocument } from "@/hooks/use-user-document";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
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
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { FileText, Upload, CheckCircle2, Clock, XCircle, Download, Eye } from "lucide-react";
import type { TUserDocument } from "@/schema/user-document.schema";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  VERIFIED: { label: "Đã duyệt", className: "bg-emerald-500", icon: CheckCircle2 },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-500", icon: CheckCircle2 },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-500", icon: Clock },
  UNDER_REVIEW: { label: "Đang xem xét", className: "bg-sky-500", icon: Clock },
  REJECTED: { label: "Bị từ chối", className: "bg-rose-500", icon: XCircle },
};

const DOCUMENT_LABELS: Record<string, string> = {
  national_id: "Căn cước công dân",
  id_card: "CCCD/CMND",
  driver_license: "Giấy phép lái xe",
  passport: "Hộ chiếu",
  other: "Khác",
};

export default function DocumentsTab() {
  const { currentUser } = useAuthContext();
  const userId = currentUser?._id;

  const documentsQuery = useUserDocument(userId);
  const { submitDocument } = useUserDocument(userId);

  const documents = useMemo(
    () => (documentsQuery.data?.data?.data ?? []) as TUserDocument[],
    [documentsQuery.data?.data?.data],
  );

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    documentType: "national_id",
    identityNumber: "",
    drivingLicenseNumber: "",
    frontImage: null as File | null,
    backImage: null as File | null,
    drivingLicenseImage: null as File | null,
  });

  const onChangeFile =
    (field: "frontImage" | "backImage" | "drivingLicenseImage") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Tệp không được lớn hơn 5MB.");
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        alert("Chỉ chấp nhận định dạng JPG hoặc PNG.");
        return;
      }
      setUploadData((prev) => ({ ...prev, [field]: file }));
    };

  const handleSubmit = () => {
    if (!userId) return;

    if (
      !uploadData.identityNumber ||
      !uploadData.drivingLicenseNumber ||
      !uploadData.frontImage ||
      !uploadData.backImage ||
      !uploadData.drivingLicenseImage
    ) {
      alert("Vui lòng điền đủ thông tin và đính kèm đầy đủ ảnh.");
      return;
    }

    submitDocument.mutate(
      {
        user: userId,
        documentType: uploadData.documentType,
        identityNumber: uploadData.identityNumber,
        drivingLicenseNumber: uploadData.drivingLicenseNumber,
        frontImage: uploadData.frontImage,
        backImage: uploadData.backImage,
        drivingLicenseImage: uploadData.drivingLicenseImage,
      },
      {
        onSuccess: () => {
          alert("Tải lên tài liệu thành công. Vui lòng đợi xác minh.");
          setShowUploadDialog(false);
          setUploadData({
            documentType: "national_id",
            identityNumber: "",
            drivingLicenseNumber: "",
            frontImage: null,
            backImage: null,
            drivingLicenseImage: null,
          });
        },
      },
    );
  };

  const renderStatusBadge = (status: string) => {
    const normalized = status?.toUpperCase?.() ?? status;
    const variant = STATUS_CONFIG[normalized] ?? {
      label: status,
      className: "bg-slate-500",
      icon: Clock,
    };
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.className} text-white`}>
        <Icon className="mr-1 h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Hồ sơ xác minh</CardTitle>
            <CardDescription>Tải lên tài liệu cá nhân để đội ngũ phê duyệt.</CardDescription>
          </div>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Tải lên tài liệu
          </Button>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
              <FileText className="h-6 w-6" />
              <p>Chưa có tài liệu nào được tải lên.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc._id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold">
                        {DOCUMENT_LABELS[doc.documentType] ?? doc.documentType}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Gửi lúc: {new Date(doc.submittedAt ?? "").toLocaleString("vi-VN")}
                      </div>
                      {doc.notes && (
                        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                          Ghi chú: {doc.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      {renderStatusBadge(doc.status)}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          Xem
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-4 w-4" />
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tải lên tài liệu</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp đầy đủ thông tin và hình ảnh rõ nét để quá trình xét duyệt diễn ra nhanh chóng.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="documentType">Loại tài liệu</Label>
                <select
                  id="documentType"
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={uploadData.documentType}
                  onChange={(event) =>
                    setUploadData((prev) => ({ ...prev, documentType: event.target.value }))
                  }
                >
                  <option value="national_id">Căn cước công dân</option>
                  <option value="driver_license">Giấy phép lái xe</option>
                  <option value="passport">Hộ chiếu</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="identityNumber">Số định danh</Label>
                <Input
                  id="identityNumber"
                  value={uploadData.identityNumber}
                  onChange={(event) =>
                    setUploadData((prev) => ({ ...prev, identityNumber: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="drivingLicenseNumber">Số giấy phép lái xe</Label>
                <Input
                  id="drivingLicenseNumber"
                  value={uploadData.drivingLicenseNumber}
                  onChange={(event) =>
                    setUploadData((prev) => ({
                      ...prev,
                      drivingLicenseNumber: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Ảnh mặt trước CCCD</Label>
                <Input type="file" accept="image/*" onChange={onChangeFile("frontImage")} />
              </div>

              <div className="grid gap-2">
                <Label>Ảnh mặt sau CCCD</Label>
                <Input type="file" accept="image/*" onChange={onChangeFile("backImage")} />
              </div>

              <div className="grid gap-2">
                <Label>Ảnh giấy phép lái xe</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={onChangeFile("drivingLicenseImage")}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={submitDocument.isPending}>
              {submitDocument.isPending ? "Đang tải lên…" : "Gửi xét duyệt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
