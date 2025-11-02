import HeaderMain from "@/components/header/header-main";
import { useBrandHook } from "@/hooks/use-brand";
import { useVehicleHook } from "@/hooks/use-vehicle";
import { BatteryCharging } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const HomeLayout = () => {
  const { useVehicleList } = useVehicleHook();
  const { useBrandList } = useBrandHook();

  const vehicleQuery = useVehicleList();
  const brandQuery = useBrandList();

  const vehicles = Array.isArray(vehicleQuery.data?.data?.data)
    ? vehicleQuery.data.data.data
    : [];
  const brands = Array.isArray(brandQuery.data?.data?.data)
    ? brandQuery.data.data.data
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <HeaderMain />
      <main className="flex-1">
        <Container>
          <motion.section
            id="vehicles"
            className="scroll-mt-24 py-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionHeading
              title="Danh sách xe sẵn sàng"
              description="Thông tin cơ bản để bạn có thể ra quyết định nhanh."
            />
            {vehicleQuery.isLoading ? (
              <p className="mt-6 text-gray-500">Đang tải danh sách xe...</p>
            ) : vehicleQuery.isError ? (
              <p className="mt-6 text-red-600">
                Không thể tải danh sách xe. Vui lòng thử lại.
              </p>
            ) : vehicles.length === 0 ? (
              <p className="mt-6 text-gray-500">Chưa có xe nào.</p>
            ) : (
              <ul className="mt-10 grid gap-6 md:grid-cols-2">
                {vehicles.map((vehicle) => (
                  <motion.li
                    key={vehicle._id}
                    className="rounded-xl border border-[#00CC66] bg-white px-6 py-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-xl font-semibold text-[#000000]">
                      {vehicle.model}
                    </div>
                    <dl className="mt-3 space-y-2 text-sm text-gray-700">
                      <div>
                        <dt className="font-medium text-[#00CC66]">Biển số</dt>
                        <dd>{vehicle.plateNo}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[#00CC66]">VIN</dt>
                        <dd>{vehicle.vin}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[#00CC66]">Trạng thái</dt>
                        <dd>
                          {vehicle.status.charAt(0).toUpperCase() +
                            vehicle.status.slice(1)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[#00CC66]">Pin hiện tại</dt>
                        <dd>{vehicle.batteryPercent}%</dd>
                      </div>
                    </dl>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.section>

          <motion.section
            id="brands"
            className="scroll-mt-24 py-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionHeading
              title="Thương hiệu đồng hành"
              description="Danh sách thương hiệu cung cấp xe điện trên nền tảng."
            />
            {brandQuery.isLoading ? (
              <p className="mt-6 text-gray-500">Đang tải danh sách thương hiệu...</p>
            ) : brandQuery.isError ? (
              <p className="mt-6 text-red-600">
                Không thể tải danh sách thương hiệu. Vui lòng thử lại.
              </p>
            ) : brands.length === 0 ? (
              <p className="mt-6 text-gray-500">Chưa có thương hiệu nào.</p>
            ) : (
              <ul className="mt-10 grid gap-6 md:grid-cols-2">
                {brands.map((brand) => (
                  <motion.li
                    key={brand._id}
                    className="rounded-xl border border-[#00CC66] bg-white px-6 py-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-xl font-semibold text-[#000000]">
                      {brand.name}
                    </div>
                    <dl className="mt-3 space-y-2 text-sm text-gray-700">
                      <div>
                        <dt className="font-medium text-[#00CC66]">Mã</dt>
                        <dd>{brand.code}</dd>
                      </div>
                      {brand.description && (
                        <div>
                          <dt className="font-medium text-[#00CC66]">Mô tả</dt>
                          <dd>{brand.description}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="font-medium text-[#00CC66]">Giá thuê ngày</dt>
                        <dd>{brand.baseDailyRate.toLocaleString("vi-VN")} đ</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[#00CC66]">Tiền cọc</dt>
                        <dd>{brand.depositAmount.toLocaleString("vi-VN")} đ</dd>
                      </div>
                    </dl>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.section>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

const Container = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
);

const SectionHeading = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div className="max-w-2xl">
    <h2 className="text-3xl font-bold text-[#000000]">{title}</h2>
    {description && (
      <p className="mt-2 text-base text-gray-600">{description}</p>
    )}
  </div>
);

const Footer = () => (
  <footer className="border-t bg-[#f9f9f9] py-10 text-sm text-gray-600">
    <Container>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2 text-[#00CC66]">
          <BatteryCharging className="h-4 w-4" />
          <span>© {new Date().getFullYear()} EVrent. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a className="hover:text-[#00CC66] transition" href="#privacy">Privacy</a>
          <a className="hover:text-[#00CC66] transition" href="#terms">Terms</a>
          <a className="hover:text-[#00CC66] transition" href="#contact">Contact</a>
        </div>
      </div>
    </Container>
  </footer>
);

export default HomeLayout;
