import { Loader2, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { useBrandHook } from '@/hooks/use-brand';
import { toast } from 'sonner';

interface DeleteBrandDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand?: {
        _id: string;
        code: string;
        name: string;
    } | null;
}

export default function DeleteBrandDialog({
    open,
    onOpenChange,
    brand,
}: DeleteBrandDialogProps) {
    const { deleteBrand } = useBrandHook();

    const handleDelete = async () => {
        if (!brand) return;

        try {
            await deleteBrand.mutateAsync(brand._id);
            toast.success('Xóa thương hiệu thành công!');
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
            toast.error(errorMessage);
        }
    };

    const isLoading = deleteBrand.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Xác nhận xóa thương hiệu
                    </DialogTitle>
                    <DialogDescription className="pt-4">
                        Bạn có chắc chắn muốn xóa thương hiệu <strong>{brand?.name}</strong> (
                        {brand?.code})?
                        <br />
                        <br />
                        <span className="text-red-500 font-medium">
                            <span role="img" aria-label="warning">⚠️</span> Hành động này không thể hoàn tác!
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
