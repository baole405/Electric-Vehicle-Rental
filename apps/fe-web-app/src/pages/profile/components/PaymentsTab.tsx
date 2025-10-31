import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { CreditCard } from "lucide-react";

export default function PaymentsTab() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử thanh toán</CardTitle>
                    <CardDescription>Tính năng đang được phát triển</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Lịch sử thanh toán sẽ được hiển thị tại đây</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
