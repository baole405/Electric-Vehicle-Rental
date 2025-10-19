import HeaderMain from "@/components/header/header-main";
import { useBrandHook } from "@/hooks/use-brand";
import { useVehicleHook } from "@/hooks/use-vehicle";
import { BatteryCharging } from "lucide-react";
import type { ReactNode } from "react";

const HomeLayout = () => {
  const { useVehicleList } = useVehicleHook();
  const { useBrandList } = useBrandHook();

  const vehicleQuery = useVehicleList();
  const brandQuery = useBrandList();

  const vehiclesData = vehicleQuery.data?.data?.data;
  const brandsData = brandQuery.data?.data?.data;

  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
  const brands = Array.isArray(brandsData) ? brandsData : [];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeaderMain />
      <main className="flex-1">
        <Container>
          <section id="vehicles" className="scroll-mt-24 py-12">
            <SectionHeading
              title="Danh sach xe san sang"
              description="Thong tin co ban de ban co the ra quyet dinh nhanh."
            />
            {vehicleQuery.isLoading ? (
              <p className="mt-6 text-gray-500">Dang tai danh sach xe...</p>
            ) : vehicleQuery.isError ? (
              <p className="mt-6 text-red-600">
                Khong the tai danh sach xe. Vui long thu lai.
              </p>
            ) : vehicles.length === 0 ? (
              <p className="mt-6 text-gray-500">Chua co xe nao.</p>
            ) : (
              <ul className="mt-8 grid gap-4 md:grid-cols-2">
                {vehicles.map((vehicle) => {
                  const statusLabel =
                    vehicle.status.charAt(0).toUpperCase() +
                    vehicle.status.slice(1);

                  return (
                    <li
                      key={vehicle._id}
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 shadow-sm"
                    >
                      <div className="text-lg font-semibold text-gray-900">
                        {vehicle.model}
                      </div>
                      <dl className="mt-3 space-y-1 text-sm text-gray-600">
                        <div>
                          <dt className="font-medium text-gray-500">Bien so</dt>
                          <dd>{vehicle.plateNo}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">VIN</dt>
                          <dd>{vehicle.vin}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">
                            Trang thai
                          </dt>
                          <dd>{statusLabel}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">
                            Pin hien tai
                          </dt>
                          <dd>{vehicle.batteryPercent}%</dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section id="brands" className="scroll-mt-24 py-12">
            <SectionHeading
              title="Thuong hieu dong hanh"
              description="Danh sach thuong hieu cung cap xe dien tren nen tang."
            />
            {brandQuery.isLoading ? (
              <p className="mt-6 text-gray-500">
                Dang tai danh sach thuong hieu...
              </p>
            ) : brandQuery.isError ? (
              <p className="mt-6 text-red-600">
                Khong the tai danh sach thuong hieu. Vui long thu lai.
              </p>
            ) : brands.length === 0 ? (
              <p className="mt-6 text-gray-500">Chua co thuong hieu nao.</p>
            ) : (
              <ul className="mt-8 grid gap-4 md:grid-cols-2">
                {brands.map((brand) => (
                  <li
                    key={brand._id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 shadow-sm"
                  >
                    <div className="text-lg font-semibold text-gray-900">
                      {brand.name}
                    </div>
                    <dl className="mt-3 space-y-1 text-sm text-gray-600">
                      <div>
                        <dt className="font-medium text-gray-500">Ma</dt>
                        <dd>{brand.code}</dd>
                      </div>
                      {brand.description ? (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Mo ta
                          </dt>
                          <dd>{brand.description}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="font-medium text-gray-500">
                          Gia thue ngay co ban
                        </dt>
                        <dd>
                          {brand.baseDailyRate.toLocaleString("vi-VN")} d
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Tien coc</dt>
                        <dd>
                          {brand.depositAmount.toLocaleString("vi-VN")} d
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

const Container = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    {children}
  </div>
);

const SectionHeading = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div className="max-w-2xl">
    <h2 className="text-3xl font-semibold text-gray-900">{title}</h2>
    {description ? (
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    ) : null}
  </div>
);

const Footer = () => (
  <footer className="border-t bg-white py-8 text-sm text-gray-600">
    <Container>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2 text-gray-500">
          <BatteryCharging className="h-4 w-4" />
          <span>Copyright {new Date().getFullYear()} EVrent. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a className="hover:text-primary" href="#privacy">
            Privacy
          </a>
          <a className="hover:text-primary" href="#terms">
            Terms
          </a>
          <a className="hover:text-primary" href="#contact">
            Contact
          </a>
        </div>
      </div>
    </Container>
  </footer>
);

export default HomeLayout;
