import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/route.constants";
import { useAuthContext } from "@/contexts/auth-context";
import { useVehicleHook } from "@/hooks/use-vehicle";
import { useStationHook } from "@/hooks/use-station";
import { useBooking } from "@/hooks/use-booking";
import { useRentalHook } from "@/hooks/use-rental";
import type { TVehicle } from "@/schema/vehicle.schema";
import type { TStation } from "@/schema/station.schema";
import type { TBooking } from "@/schema/booking.schema";
import type { TRental } from "@/schema/rental.schema";
import {
  BatteryCharging,
  Calendar,
  Car,
  ChevronDown,
  CreditCard,
  FileText,
  HandCoins,
  Handshake,
  KeyRound,
  Menu,
  MapPin,
  Search,
  ShieldCheck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

type ApiItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  note?: string;
};


const API_ITEMS: ApiItem[] = [
  { label: "Users", href: "/api/users", icon: User },
  { label: "User documents", href: "/api/user-documents", icon: FileText, note: "user, verifiedBy" },
  { label: "Stations", href: "/api/stations", icon: MapPin },
  { label: "Vehicles", href: "/api/vehicles", icon: Car, note: "station" },
  { label: "Bookings", href: "/api/bookings", icon: Calendar, note: "renter, pickupStation, vehicle" },
  { label: "Rentals", href: "/api/rentals", icon: KeyRound, note: "booking, renter, vehicle, pickupStation, returnStation" },
  { label: "Handovers", href: "/api/handovers", icon: Handshake, note: "rental, vehicle, staff" },
  { label: "Payments", href: "/api/payments", icon: CreditCard, note: "rental" },
];

const VEHICLE_IMAGES = [
  "https://images.unsplash.com/photo-1619767886558-efdc259cde1b?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1650554043095-9b6ce79076d4?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605559424843-9e4b2b9f5d8a?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1627627251072-b88f6a3bd86c?q=80&w=1920&auto=format&fit=crop",
];


function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

function NavBar() {
  const [open, setOpen] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);
  const { currentUser } = useAuthContext();
  const isStaff = currentUser?.role === "staff" || currentUser?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BatteryCharging className="h-5 w-5 text-primary" />
            <span>EVrent</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a className="hover:text-primary" href="#vehicles">
              Electric Fleet
            </a>
            <a className="hover:text-primary" href="#stations">
              Stations
            </a>
            <a className="hover:text-primary" href="#how">
              How it works
            </a>
            <a className="hover:text-primary" href="#pricing">
              Pricing
            </a>
            {isStaff ? (
              <>
                <Link className="hover:text-primary" to="/dashboard">
                  Dashboard
                </Link>
                <div className="relative">
                  <button type="button" className="inline-flex items-center gap-1 hover:text-primary" onClick={() => setApiOpen((v) => !v)}>
                    API
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {apiOpen ? (
                    <div className="absolute right-0 mt-2 w-[420px] rounded-2xl border bg-white p-2 shadow-xl">
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {API_ITEMS.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="group flex items-start gap-3 rounded-xl p-3 hover:bg-gray-50"
                          >
                            <item.icon className="mt-1 h-5 w-5 text-gray-500 group-hover:text-primary" />
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className="text-[11px] text-gray-500">
                                {item.href}
                                {item.note ? (
                                  <>
                                    <span className="mx-1 text-gray-400">-</span>
                                    <span className="italic">{item.note}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
              to={ROUTES.LOGIN}
            >
              Sign in
            </Link>
          </div>

          <button className="inline-flex items-center justify-center rounded-lg border p-2 md:hidden" type="button" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm">
              <a className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50" href="#vehicles">
                Electric Fleet
              </a>
              <a className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50" href="#stations">
                Stations
              </a>
              <a className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50" href="#how">
                How it works
              </a>
              <a className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50" href="#pricing">
                Pricing
              </a>
              {isStaff ? (
                <>
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50" to="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <a className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50" href="#api">
                    API Reference
                  </a>
                </>
              ) : null}
              <div className="grid gap-2">
                <Link
                  className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
                  to={ROUTES.LOGIN}
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  );
}

function Hero() {
  const { useVehicleList } = useVehicleHook();
  const vehicleQuery = useVehicleList();

  const vehicles = (vehicleQuery.data?.data?.data ?? []) as TVehicle[];
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "available").length;
  const sampleVehicles = vehicles.slice(0, 2);

  const sampleContent = () => {
    if (vehicleQuery.isLoading) {
      return Array.from({ length: 2 }).map((_, index) => (
        <div key={`hero-skeleton-${index}`} className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
          <div className="h-16 w-24 animate-pulse rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ));
    }

    if (!sampleVehicles.length) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Add vehicles to your fleet to see highlights here.
        </div>
      );
    }

    return sampleVehicles.map((vehicle, index) => (
      <div key={vehicle._id ?? index} className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
        <div
          className="h-16 w-24 rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${VEHICLE_IMAGES[index % VEHICLE_IMAGES.length]})` }}
        />
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{vehicle.model}</div>
          <div className="text-xs text-gray-500">
            Station {vehicle.stationId} | Plate {vehicle.plateNo}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">{formatCurrency(vehicle.dailyRate)}</div>
          <div className="text-xs text-gray-500">per day</div>
        </div>
      </div>
    ));
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-gray-50">
      <Container>
        <div className="grid gap-10 py-16 md:grid-cols-2 md:items-center lg:py-20">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
              Smart EV rental platform
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Rent electric vehicles with real-time fleet intelligence
            </h1>
            <p className="max-w-xl text-base text-gray-600">
              Manage bookings, charging, and fleet performance with one modern workspace. API friendly, operations ready, and designed for teams that move fast.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90" href="#pricing">
                Explore pricing
              </a>
              <a className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-900 hover:border-primary/40 hover:text-primary" href="#how">
                <ShieldCheck className="h-4 w-4" />
                How we verify vehicles
              </a>
            </div>

            <dl className="grid gap-4 text-sm text-gray-700 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="text-2xl font-semibold text-gray-900">{vehicleQuery.isLoading ? "--" : `${vehicles.length}`}</div>
                <div className="text-xs text-gray-500">Total vehicles</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="text-2xl font-semibold text-gray-900">{vehicleQuery.isLoading ? "--" : `${availableVehicles}`}</div>
                <div className="text-xs text-gray-500">Available today</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="text-2xl font-semibold text-gray-900">98%</div>
                <div className="text-xs text-gray-500">Customer satisfaction</div>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 hidden h-32 w-32 rounded-full bg-primary/10 blur-3xl md:block" />
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Available today</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {vehicleQuery.isLoading ? "Updating..." : `${availableVehicles} vehicles`}
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <BatteryCharging className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-6 space-y-4">{sampleContent()}</div>
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
                API-first architecture • Webhooks • Real-time telematics
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function StationsPreview() {
  const { useStationList } = useStationHook();
  const stationQuery = useStationList();

  const stations = (stationQuery.data?.data?.data ?? []) as TStation[];
  const activeStations = stations.filter((station) => station.status === "active");
  const topStations = activeStations.slice(0, 3);

  let stationList: ReactNode;
  if (stationQuery.isLoading) {
    stationList = Array.from({ length: 3 }).map((_, index) => (
      <li key={`station-skeleton-${index}`} className="h-6 w-full animate-pulse rounded bg-gray-200" />
    ));
  } else if (stationQuery.isError) {
    stationList = (
      <li className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
        Unable to load stations right now. Please try again later.
      </li>
    );
  } else if (!topStations.length) {
    stationList = <li className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-600">No stations configured yet.</li>;
  } else {
    stationList = topStations.map((station) => (
      <li key={station._id} className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/60 px-3 py-2">
        <MapPin className="h-4 w-4 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{station.name}</span>
          <span className="text-xs text-gray-600">{station.address ?? "Address updating"}</span>
        </div>
      </li>
    ));
  }

  return (
    <section id="stations" className="py-12 lg:py-16">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Charging & pickup network</h2>
            <p className="text-sm text-gray-600">
              EVrent currently operates {activeStations.length} active hubs across the network. Choose the location that best fits your route.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">{stationList}</ul>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
            <div
              className="aspect-video w-full overflow-hidden rounded-2xl bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1600&auto=format&fit=crop')" }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function ProcessSteps() {
  const steps = [
    { title: "Search & compare", description: "Filter by range, seating, and availability in real time.", icon: Search },
    { title: "Verify documents", description: "Upload driver credentials for instant verification.", icon: FileText },
    { title: "Pick up & drive", description: "Collect at the selected hub with a guided handover.", icon: Handshake },
    { title: "Smart charging", description: "Monitor charging sessions and pay with contactless billing.", icon: HandCoins },
  ];

  return (
    <section id="how" className="border-y bg-white py-12 lg:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Simple, reliable rental workflow</h2>
            <p className="mt-3 text-sm text-gray-600">Designed for operation teams with visibility into every booking, vehicle, and charging session.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step) => (
              <div key={step.title} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-600">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function KPISection() {
  const { useVehicleList } = useVehicleHook();
  const { useStationList } = useStationHook();
  const { useBookingList } = useBooking();
  const { useRentalList } = useRentalHook();

  const vehicleQuery = useVehicleList();
  const stationQuery = useStationList();
  const bookingQuery = useBookingList();
  const rentalQuery = useRentalList();

  const vehicles = (vehicleQuery.data?.data?.data ?? []) as TVehicle[];
  const stations = (stationQuery.data?.data?.data ?? []) as TStation[];
  const bookings = (bookingQuery.data?.data?.data ?? []) as TBooking[];
  const rentals = (rentalQuery.data?.data?.data ?? []) as TRental[];

  const activeStations = stations.filter((station) => station.status === "active").length;
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "available").length;
  const activeRentals = rentals.filter((rental) => rental.status === "ongoing").length;

  const isLoading =
    vehicleQuery.isLoading || stationQuery.isLoading || bookingQuery.isLoading || rentalQuery.isLoading;
  const isError = vehicleQuery.isError || stationQuery.isError || bookingQuery.isError || rentalQuery.isError;

  let statsContent: ReactNode;
  if (isLoading) {
    statsContent = Array.from({ length: 4 }).map((_, index) => (
      <div key={`kpi-skeleton-${index}`} className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white" />
    ));
  } else if (isError) {
    statsContent = (
      <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Unable to load latest metrics right now. Please refresh the page.
      </div>
    );
  } else {
    const stats = [
      { value: activeStations.toString(), label: "Stations online" },
      { value: vehicles.length.toString(), label: "Vehicles in fleet" },
      { value: availableVehicles.toString(), label: "Vehicles available" },
      { value: activeRentals.toString(), label: "Active rentals" },
    ];

    statsContent = stats.map((stat) => (
      <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <div className="text-3xl font-semibold text-gray-900">{stat.value}</div>
        <div className="mt-1 text-xs text-gray-600">{stat.label}</div>
      </div>
    ));
  }

  return (
    <section className="border-b bg-gray-50 py-12 lg:py-16">
      <Container>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{statsContent}</div>
      </Container>
    </section>
  );
}

function CTASection() {
  return (
    <section id="pricing" className="py-12 lg:py-16">
      <Container>
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-8 text-center shadow-sm sm:p-12">
          <h3 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Ready for greener mobility?</h3>
          <p className="mt-2 text-sm text-gray-600">Create an account to claim an intro offer for your first rental.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90" href="#get-started">
              Start now
            </a>
            <a className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-900 hover:border-primary/40" href="#how">
              View workflow
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8 text-sm text-gray-600">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-gray-500">
            <BatteryCharging className="h-4 w-4" />
            <span>Â© {new Date().getFullYear()} EVrent. All rights reserved.</span>
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
}

const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <Hero />
      <FeaturedVehicles />
      <StationsPreview />
      <ProcessSteps />
      <KPISection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomeLayout;





