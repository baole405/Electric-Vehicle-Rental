import { UserDocumentApi } from '@/apis/user-document.api';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { useAllUserDocuments } from '@/hooks/use-user-document';
import { BadgeStatus, fmt, mapStatusColor, statusText } from '@/lib/utils';
import type { TUserDocument } from '@/schema/user-document.schema';
import { Check, FileText, Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export function StaffDocumentVerification() {
  const documentQuery = useAllUserDocuments();
  const documents = (documentQuery.data?.data?.data ?? []) as TUserDocument[];

  // Filter only pending documents for staff
  const pendingDocuments = documents.filter((doc) =>
    ['pending', 'PENDING', 'under_review', 'UNDER_REVIEW'].includes(doc.status)
  );

  const handleApprove = async (docId: string) => {
    try {
      await UserDocumentApi.updateDocument(docId, {
        status: 'verified',
      });
      toast.success('✅ Đã duyệt hồ sơ!');
      await documentQuery.refetch();
    } catch (error) {
      console.error('Failed to approve document:', error);
      toast.error('❌ Lỗi khi duyệt hồ sơ!');
    }
  };

  const handleReject = async (docId: string) => {
    const notes = prompt('Lý do từ chối (optional):');
    try {
      await UserDocumentApi.updateDocument(docId, {
        status: 'rejected',
        notes: notes || 'Hồ sơ không đạt yêu cầu',
      });
      toast.success('📝 Đã từ chối hồ sơ!');
      await documentQuery.refetch();
    } catch (error) {
      console.error('Failed to reject document:', error);
      toast.error('❌ Lỗi khi từ chối hồ sơ!');
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            <FileText className="inline h-5 w-5 mr-2" />
            Duyệt hồ sơ khách hàng
          </h2>
          <p className="text-sm text-gray-500">
            {pendingDocuments.length} hồ sơ chờ duyệt
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => documentQuery.refetch()}
          disabled={documentQuery.isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              documentQuery.isLoading ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </Button>
      </div>

      {documentQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
          <span>Đang tải hồ sơ...</span>
        </div>
      ) : pendingDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 border border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-gray-300 mb-2" />
          <p>Không có hồ sơ nào chờ duyệt</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Khách hàng</TableHead>
                <TableHead>Loại giấy tờ</TableHead>
                <TableHead>CMND/CCCD</TableHead>
                <TableHead>GPLX</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày nộp</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDocuments.map((doc) => {
                const userName =
                  typeof doc.user === 'object' && doc.user !== null
                    ? (doc.user as { fullName?: string; email?: string })
                        .fullName || (doc.user as { email?: string }).email
                    : 'N/A';

                return (
                  <TableRow key={doc._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium">{userName}</div>
                      {typeof doc.user === 'object' && doc.user !== null && (
                        <div className="text-xs text-gray-500">
                          {(doc.user as { email?: string }).email}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {doc.documentType === 'national_id'
                          ? 'CMND/CCCD'
                          : doc.documentType.replace('_', ' ')}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-mono">
                        {doc.identityNumber || 'N/A'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-mono">
                        {doc.drivingLicenseNumber || 'N/A'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <BadgeStatus variant={mapStatusColor(doc.status)}>
                        {statusText(doc.status)}
                      </BadgeStatus>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {fmt(doc.submittedAt)}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          onClick={() => handleApprove(doc._id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleReject(doc._id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
