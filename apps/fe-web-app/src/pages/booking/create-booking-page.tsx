import { useBooking } from "@/hooks/use-booking";
import { useStationHook } from "@/hooks/use-station";
import { useVehicleHook } from "@/hooks/use-vehicle";
import { Loader2, MapPin, CalendarClock, Car } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Card } from "@/components/shadcn/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/shadcn/ui/select";
import { useParams } from "react-router";
import { useState } from "react";
import type { TCreateBooking } from "@/schema/booking.schema";

export default function CreateBookingPage() {
  const { id } = useParams(); // id của vehicle
  const { createBooking } = useBooking();
  const { mutate, isPending } = createBooking;

  // === Load dữ liệu ===
  const { useStationList } = useStationHook();
  const { data: stationRes } = useStationList();
  const stations = stationRes?.data?.data ?? [];

  const { useVehicleById } = useVehicleHook();
  const { data: vehicleRes } = useVehicleById(id!);
  const vehicle = vehicleRes?.data?.data;

  // === User giả định đã đăng nhập ===
  const loggedUser = {
    _id: "68e718afaf76367c856de771",
    fullName: "Alice Nguyen",
    email: "alice.nguyen@example.com",
  };

  // === State form ===
  const [form, setForm] = useState({
    pickupStation: "",
    pickupTimeExpected: "",
  });

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // === Submit payload ===
  const handleSubmit = () => {
    if (!form.pickupStation || !form.pickupTimeExpected) {
      alert("Vui lòng chọn trạm và thời gian nhận xe!");
      return;
    }

    const payload: TCreateBooking = {
      renter: loggedUser._id,
      pickupStation: form.pickupStation,
      vehicle: id ?? null,
      pickupTimeExpected: new Date(form.pickupTimeExpected).toISOString(),
      status: "pending",
    };

    console.log("📦 Payload gửi API:", payload);
    mutate(payload);
  };

  // === UI ===
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM BÊN TRÁI */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md space-y-6">
          <h1 className="text-2xl font-bold">Đăng ký thuê xe</h1>

          {/* Thông tin người thuê */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Tên người thuê *</Label>
              <Input value={loggedUser.fullName} disabled />
            </div>
            <div>
              <Label>Email *</Label>
              <Input value={loggedUser.email} disabled />
            </div>
          </div>

          {/* Chọn trạm */}
          <div>
            <Label>Nơi nhận xe *</Label>
            <Select onValueChange={(v) => handleChange("pickupStation", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạm nhận xe" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((st: any) => (
                  <SelectItem key={st._id} value={st._id}>
                    {st.name} — {st.address ?? "Không rõ địa chỉ"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thời gian nhận xe */}
          <div>
            <Label>Thời gian nhận xe dự kiến *</Label>
            <Input
              type="datetime-local"
              onChange={(e) =>
                handleChange("pickupTimeExpected", e.target.value)
              }
            />
          </div>

          {/* Nút xác nhận */}
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-5 text-lg font-medium"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" /> Đang xử lý...
              </>
            ) : (
              "Xác nhận đặt xe"
            )}
          </Button>
        </div>

        {/* BÊN PHẢI: THÔNG TIN XE & TỔNG KẾT */}
        <Card className="p-6 shadow-md rounded-2xl bg-white space-y-4">
          {/* Ảnh & thông tin xe */}
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <Car className="text-gray-400 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {vehicle?.model ?? "Xe đang tải..."}
              </h2>
              <p className="text-sm text-gray-500">{vehicle?.plateNo}</p>
            </div>
          </div>

          {/* Thông tin chọn */}
          <div className="text-gray-700 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              Trạm:{" "}
              {form.pickupStation
                ? stations.find((s: any) => s._id === form.pickupStation)?.name
                : "Chưa chọn"}
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock size={16} />
              Giờ nhận:{" "}
              {form.pickupTimeExpected
                ? new Date(form.pickupTimeExpected).toLocaleString("vi-VN")
                : "Chưa chọn"}
            </div>
          </div>

          <hr />

          {/* Chi phí */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Cước phí niêm yết</span>
              <span className="font-semibold text-gray-800">590.000₫</span>
            </div>
            <div className="flex justify-between">
              <span>Tiền đặt cọc</span>
              <span className="font-semibold text-gray-800">5.000.000₫</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Tổng thanh toán</span>
              <span className="text-emerald-600">5.590.000₫</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            *Giá thuê xe đã bao gồm VAT.
            <br />*Cần xác nhận từ nhân viên trước khi nhận xe.
          </p>
        </Card>
      </div>
    </div>
  );
}
