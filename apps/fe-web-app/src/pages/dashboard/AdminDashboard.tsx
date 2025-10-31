import { UserDocumentApi } from '@/apis/user-document.api';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { useAuthContext } from '@/contexts/auth-context';
import { useBooking } from '@/hooks/use-booking';
import { useBrandHook } from '@/hooks/use-brand';
import { useHandoverHook } from '@/hooks/use-handover';
import { usePaymentHook } from '@/hooks/use-payment';
import { useRentalHook } from '@/hooks/use-rental';
import { useStationHook } from '@/hooks/use-station';
import { useUserHook } from '@/hooks/use-user';
import { useAllUserDocuments } from '@/hooks/use-user-document';
import { useVehicleHook } from '@/hooks/use-vehicle';
import DashboardLayout from '@/layouts/dashboard/dashboard-layout';
import { BadgeStatus, cn, fmt, mapStatusColor, statusText } from '@/lib/utils';
import type { TBooking, TCreateBooking } from '@/schema/booking.schema';
import type { TBrand } from '@/schema/brand.schema';
import type { TPayment } from '@/schema/payment.schema';
import type { TRental } from '@/schema/rental.schema';
import type { TStation } from '@/schema/station.schema';
import type { TUserDocument } from '@/schema/user-document.schema';
import type { TUser } from '@/schema/user.schema';
import type { TVehicle } from '@/schema/vehicle.schema';
import {
  Check,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
  LayoutDashboard,
  Users,
  Building2,
  Car,
  ClipboardList,
  Landmark,
  CreditCard,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

// API Request Types (server expects string IDs, not full objects)
type CreateRentalRequest = {
  renter: string;
  vehicle: string;
  booking: string;
  pickupStation: string;
  returnStation?: string;
  status: TRental['status'];
};

type CreatePaymentRequest = {
  rental: string;
  method: TPayment['method'];
  status: TPayment['status'];
  surchargeAmount?: number;
};

type CreateUserForm = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: TUser['role'];
};

type CreateStationForm = {
  code: string;
  name: string;
  status: TStation['status'];
};

type CreateVehicleForm = {
  vin: string;
  brandId: string;
  plateNo: string;
  stationId: string;
  status: TVehicle['status'];
  batteryPercent?: number;
  odometer?: number;
};

type CreateBookingForm = {
  renterName: string;
  phoneNumber: string;
  email: string;
  brandId: string;
  stationId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  paymentMethod: string;
  pickupLocation?: string;
  promoCode?: string;
  notes?: string;
};

type UpdateBookingStatusForm = {
  id: string;
  status: string;
};

type CreateRentalForm = {
  renter: string;
  vehicle: string;
  booking: string;
  pickupStation: string;
  returnStation?: string;
  status: string;
};

type CreatePaymentForm = {
  rental: string;
  method: string;
  status: string;
  surchargeAmount?: number;
};

type CreateBrandForm = {
  code: string;
  name: string;
  baseDailyRate: number;
  depositAmount: number;
  description?: string;
};

const ensureText = (value: unknown, fallback: string): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidates = [
      'fullName',
      'name',
      'model',
      'code',
      'plateNo',
      'identityNumber',
      'vin',
      '_id',
    ];
    for (const key of candidates) {
      const candidateValue = record[key];
      if (typeof candidateValue === 'string') {
        return candidateValue;
      }
    }
  }
  return fallback;
};

const ensureArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

type SectionKey =
  | 'overview'
  | 'users'
  | 'stations'
  | 'vehicles'
  | 'bookings'
  | 'rentals'
  | 'payments'
  | 'documents'
  | 'brands';

type SectionConfig = {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
  roles: Array<'admin' | 'staff'>;
};

const SECTION_CONFIG: SectionConfig[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  { key: 'users', label: 'Users', icon: Users, roles: ['admin'] },
  { key: 'stations', label: 'Stations', icon: Building2, roles: ['admin'] },
  { key: 'vehicles', label: 'Vehicles', icon: Car, roles: ['admin'] },
  {
    key: 'bookings',
    label: 'Orders',
    icon: ClipboardList,
    roles: ['admin', 'staff'],
  },
  { key: 'rentals', label: 'Rentals', icon: Landmark, roles: ['admin'] },
  { key: 'payments', label: 'Payments', icon: CreditCard, roles: ['admin'] },
  {
    key: 'documents',
    label: 'User documents',
    icon: FileText,
    roles: ['admin', 'staff'],
  },
  { key: 'brands', label: 'Brands', icon: Building2, roles: ['admin'] },
];
const AdminDashboard = () => {
  const { currentUser, role: cachedRole } = useAuthContext();
  const effectiveRole = cachedRole ?? currentUser?.role ?? 'renter';
  const isAdmin = effectiveRole === 'admin';
  const isStaff = effectiveRole === 'staff';
  const hasStaffAccess = isAdmin || isStaff;

  const allowedSections = useMemo(
    () =>
      SECTION_CONFIG.filter((item) =>
        isAdmin
          ? item.roles.includes('admin')
          : isStaff
            ? item.roles.includes('staff')
            : false
      ),
    [isAdmin, isStaff]
  );
  const sidebarItems = useMemo(
    () =>
      allowedSections.map((item) => {
        const Icon = item.icon;
        return {
          key: item.key,
          label: item.label,
          icon: <Icon className="h-4 w-4" />,
          roles: item.roles,
        };
      }),
    [allowedSections]
  );
  const [activeSection, setActiveSection] = useState<SectionKey>(
    (allowedSections[0]?.key ??
      (isAdmin ? 'overview' : 'bookings')) as SectionKey
  );
  useEffect(() => {
    if (
      allowedSections.length > 0 &&
      !allowedSections.some((item) => item.key === activeSection)
    ) {
      setActiveSection(allowedSections[0].key);
    }
  }, [activeSection, allowedSections]);

  const { useVehicleList, createVehicle, deleteVehicle } = useVehicleHook();
  const { useBookingList, createBooking, updateBooking, deleteBooking } =
    useBooking();
  const { useRentalList, createRental, deleteRental } = useRentalHook();
  const { useStationList, createStation, deleteStation } = useStationHook();
  const handover = useHandoverHook();
  const { useUserList, createUser, deleteUser } = useUserHook();
  const { useBrandList, createBrand, deleteBrand } = useBrandHook();
  const { usePaymentList, createPayment, deletePayment } = usePaymentHook();

  const vehicleQuery = useVehicleList();
  const bookingQuery = useBookingList();
  const rentalQuery = useRentalList();
  const stationQuery = useStationList();
  const userQuery = useUserList();
  const brandQuery = useBrandList();
  const paymentQuery = usePaymentList();
  const documentQuery = useAllUserDocuments();

  const vehicles = useMemo(
    () => ensureArray<TVehicle>(vehicleQuery.data?.data?.data),
    [vehicleQuery.data?.data?.data]
  );
  const bookings = useMemo(
    () => ensureArray<TBooking>(bookingQuery.data?.data?.data),
    [bookingQuery.data?.data?.data]
  );
  const rentals = useMemo(
    () => ensureArray<TRental>(rentalQuery.data?.data?.data),
    [rentalQuery.data?.data?.data]
  );
  const stations = useMemo(
    () => ensureArray<TStation>(stationQuery.data?.data?.data),
    [stationQuery.data?.data?.data]
  );
  const users = useMemo(
    () => ensureArray<TUser>(userQuery.data?.data?.data),
    [userQuery.data?.data?.data]
  );
  const brands = useMemo(
    () => ensureArray<TBrand>(brandQuery.data?.data?.data),
    [brandQuery.data?.data?.data]
  );
  const payments = useMemo(
    () => ensureArray<TPayment>(paymentQuery.data?.data?.data),
    [paymentQuery.data?.data?.data]
  );
  const userDocuments = useMemo(
    () => ensureArray<TUserDocument>(documentQuery.data?.data?.data),
    [documentQuery.data?.data?.data]
  );

  const stats = useMemo(
    () => ({
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter(
        (vehicle) => vehicle.status === 'available'
      ).length,
      activeRentals: rentals.filter((rental) => rental.status === 'ongoing')
        .length,
      pendingBookings: bookings.filter(
        (booking) => booking.status === 'pending_payment'
      ).length,
    }),
    [bookings, rentals, vehicles]
  );
  const userForm = useForm<CreateUserForm>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff',
    },
  });

  const stationForm = useForm<CreateStationForm>({
    defaultValues: { code: '', name: '', status: 'active' },
  });

  const vehicleForm = useForm<CreateVehicleForm>({
    defaultValues: {
      vin: '',
      brandId: '',
      plateNo: '',
      stationId: '',
      status: 'available',
      batteryPercent: 80,
      odometer: 0,
    },
  });

  useEffect(() => {
    vehicleForm.register('brandId');
  }, [vehicleForm]);

  const bookingForm = useForm<CreateBookingForm>({
    defaultValues: {
      renterName: '',
      phoneNumber: '',
      email: '',
      brandId: '',
      stationId: '',
      pickupDate: new Date().toISOString().slice(0, 10),
      pickupTime: '09:00',
      returnDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      returnTime: '09:00',
      paymentMethod: 'online',
    },
  });

  const bookingStatusForm = useForm<UpdateBookingStatusForm>({
    defaultValues: { id: '', status: 'confirmed' },
  });

  const rentalForm = useForm<CreateRentalForm>({
    defaultValues: {
      renter: '',
      vehicle: '',
      booking: '',
      pickupStation: '',
      returnStation: '',
      status: 'ongoing',
    },
  });

  const paymentForm = useForm<CreatePaymentForm>({
    defaultValues: {
      rental: '',
      method: 'card',
      status: 'pending',
      surchargeAmount: 0,
    },
  });

  const brandForm = useForm<CreateBrandForm>({
    defaultValues: {
      code: '',
      name: '',
      baseDailyRate: 0,
      depositAmount: 0,
      description: '',
    },
  });

  const [userFeedback, setUserFeedback] = useState<string | null>(null);
  const [stationFeedback, setStationFeedback] = useState<string | null>(null);
  const [vehicleFeedback, setVehicleFeedback] = useState<string | null>(null);
  const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);
  const [rentalFeedback, setRentalFeedback] = useState<string | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);
  const [brandFeedback, setBrandFeedback] = useState<string | null>(null);

  if (!hasStaffAccess) {
    return (
      <DashboardLayout
        title="Restricted"
        subtitle="Staff workspace only"
        menuItems={[]}
        activeKey="overview"
        onSelect={() => undefined}
      >
        <Card className="mx-auto mt-20 max-w-lg space-y-4 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Staff access required
          </h2>
          <p className="text-sm text-gray-600">
            This dashboard is only available to staff or admin accounts. Contact
            an administrator if you need additional permissions.
          </p>
        </Card>
      </DashboardLayout>
    );
  }
  const handleUserSubmit = userForm.handleSubmit(async (values) => {
    try {
      setUserFeedback(null);
      await createUser.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone ? values.phone : undefined,
        password: values.password,
        role: values.role,
      });
      setUserFeedback('User created successfully.');
      userForm.reset({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
      });
    } catch (error) {
      console.error('Failed to create user', error);
      setUserFeedback('Failed to create user. Please check the details.');
    }
  });

  const handleStationSubmit = stationForm.handleSubmit(async (values) => {
    try {
      setStationFeedback(null);
      await createStation.mutateAsync(values);
      setStationFeedback('Station created.');
      stationForm.reset({ code: '', name: '', status: 'active' });
    } catch (error) {
      console.error('Failed to create station', error);
      setStationFeedback('Failed to create station.');
    }
  });

  const handleVehicleSubmit = vehicleForm.handleSubmit(async (values) => {
    try {
      setVehicleFeedback(null);
      if (!values.brandId) {
        setVehicleFeedback('Please select a brand for the vehicle.');
        return;
      }
      const brandRecord = brands.find((brand) => brand._id === values.brandId);
      await createVehicle.mutateAsync({
        brand: values.brandId,
        model: brandRecord?.name ?? 'Unknown model',
        vin: values.vin,
        plateNo: values.plateNo,
        stationId: values.stationId,
        status: values.status,
        batteryPercent:
          values.batteryPercent !== undefined
            ? Number(values.batteryPercent)
            : undefined,
        odometer:
          values.odometer !== undefined ? Number(values.odometer) : undefined,
      });
      setVehicleFeedback('Vehicle created.');
      vehicleForm.reset({
        vin: '',
        brandId: '',
        plateNo: '',
        stationId: '',
        status: 'available',
        batteryPercent: 80,
        odometer: 0,
      });
    } catch (error) {
      console.error('Failed to create vehicle', error);
      setVehicleFeedback('Failed to create vehicle.');
    }
  });

  const handleBookingSubmit = bookingForm.handleSubmit(async (values) => {
    try {
      setBookingFeedback(null);
      await createBooking.mutateAsync({
        renterName: values.renterName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        brandId: values.brandId,
        stationId: values.stationId,
        pickupDate: values.pickupDate,
        pickupTime: values.pickupTime,
        returnDate: values.returnDate,
        returnTime: values.returnTime,
        paymentMethod: values.paymentMethod as TCreateBooking['paymentMethod'],
        agreedToPaymentTerms: true,
        agreedToDataSharing: true,
        pickupLocation: values.pickupLocation,
        promoCode: values.promoCode,
        notes: values.notes,
      });
      setBookingFeedback('Booking created.');
      bookingForm.reset({
        renterName: '',
        phoneNumber: '',
        email: '',
        brandId: '',
        stationId: '',
        pickupDate: new Date().toISOString().slice(0, 10),
        pickupTime: '09:00',
        returnDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        returnTime: '09:00',
        paymentMethod: 'online',
      });
    } catch (error) {
      console.error('Failed to create booking', error);
      setBookingFeedback('Failed to create booking.');
    }
  });

  const handleBookingStatusSubmit = bookingStatusForm.handleSubmit(
    async (values) => {
      try {
        setBookingFeedback(null);
        await updateBooking.mutateAsync({
          id: values.id,
          payload: { status: values.status as TBooking['status'] },
        });
        setBookingFeedback('Booking updated.');
        bookingStatusForm.reset({ id: '', status: 'confirmed' });
      } catch (error) {
        console.error('Failed to update booking', error);
        setBookingFeedback('Failed to update booking.');
      }
    }
  );

  const handleRentalSubmit = rentalForm.handleSubmit(async (values) => {
    try {
      setRentalFeedback(null);
      // Note: API expects string IDs but TypeScript expects full objects
      // This is a type mismatch between frontend schema and backend API
      const payload: CreateRentalRequest = {
        renter: values.renter,
        vehicle: values.vehicle,
        booking: values.booking,
        pickupStation: values.pickupStation,
        returnStation: values.returnStation,
        status: values.status as TRental['status'],
      };
      await createRental.mutateAsync(payload as unknown as Partial<TRental>);
      setRentalFeedback('Rental created.');
      rentalForm.reset({
        renter: '',
        vehicle: '',
        booking: '',
        pickupStation: '',
        returnStation: '',
        status: 'ongoing',
      });
    } catch (error) {
      console.error('Failed to create rental', error);
      setRentalFeedback('Failed to create rental.');
    }
  });

  const handlePaymentSubmit = paymentForm.handleSubmit(async (values) => {
    try {
      setPaymentFeedback(null);
      // Note: API expects string ID but TypeScript expects full Rental object
      const payload: CreatePaymentRequest = {
        rental: values.rental,
        method: values.method as TPayment['method'],
        status: values.status as TPayment['status'],
        surchargeAmount:
          values.surchargeAmount !== undefined
            ? Number(values.surchargeAmount)
            : undefined,
      };
      await createPayment.mutateAsync(payload as unknown as Partial<TPayment>);
      setPaymentFeedback('Payment created.');
      paymentForm.reset({
        rental: '',
        method: 'card',
        status: 'pending',
        surchargeAmount: 0,
      });
    } catch (error) {
      console.error('Failed to create payment', error);
      setPaymentFeedback('Failed to create payment.');
    }
  });

  const handleBrandSubmit = brandForm.handleSubmit(async (values) => {
    try {
      setBrandFeedback(null);
      await createBrand.mutateAsync({
        code: values.code.toUpperCase(),
        name: values.name,
        baseDailyRate: Number(values.baseDailyRate),
        depositAmount: Number(values.depositAmount),
        description: values.description ? values.description : undefined,
      });
      setBrandFeedback('Brand created.');
      brandForm.reset({
        code: '',
        name: '',
        baseDailyRate: 0,
        depositAmount: 0,
        description: '',
      });
    } catch (error) {
      console.error('Failed to create brand', error);
      setBrandFeedback('Failed to create brand.');
    }
  });
  return (
    <DashboardLayout
      title={isAdmin ? 'Operations dashboard' : 'Workspace'}
      subtitle={
        isAdmin
          ? 'Control center for fleet, stations, and orders'
          : 'Review customer orders and documents'
      }
      menuItems={sidebarItems}
      activeKey={activeSection}
      onSelect={(key) => setActiveSection(key as SectionKey)}
    >
      {activeSection === 'overview' && (
        <div className="space-y-6 pt-6">
          {/* Stats Grid */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Vehicles"
              value={stats.totalVehicles}
              meta={`${stats.availableVehicles} available`}
              icon={Car}
              trend={{ value: 12, positive: true }}
            />
            <StatCard
              label="Active Rentals"
              value={stats.activeRentals}
              meta="Ongoing handovers"
              icon={ClipboardList}
              trend={{ value: 8, positive: true }}
            />
            <StatCard
              label="Pending Orders"
              value={stats.pendingBookings}
              meta="Awaiting approval"
              icon={Loader2}
              trend={{ value: 5, positive: false }}
            />
            <StatCard
              label="Quick Actions"
              value={
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    vehicleQuery.refetch();
                    bookingQuery.refetch();
                    rentalQuery.refetch();
                    stationQuery.refetch();
                    handover.refetch?.();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh All
                </Button>
              }
              icon={LayoutDashboard}
            />
          </section>

          {/* Recent Activity Cards Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Bookings */}
            <Card className="flex flex-col">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Recent Bookings
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Latest customer orders and reservations
                    </p>
                  </div>
                  <RefreshButton
                    onClick={() => bookingQuery.refetch()}
                    loading={bookingQuery.isLoading}
                  />
                </div>
              </div>
              <div className="flex-1 divide-y">
                {bookingQuery.isLoading ? (
                  <TableLoader />
                ) : bookings.length === 0 ? (
                  <EmptyState message="No bookings at the moment." />
                ) : (
                  bookings.slice(0, 5).map((booking) => {
                    return (
                      <div
                        key={booking._id}
                        className="group px-6 py-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-gray-900">
                              {booking.renterName || 'Unknown renter'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {booking.station?.name || booking.pickupStation?.name || 'Unknown station'}
                              </span>
                              <span>•</span>
                              <span>{booking.pickupDate} {booking.pickupTime}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Brand: {booking.brand?.name || 'TBD'}
                            </p>
                          </div>
                          <BadgeStatus variant={mapStatusColor(booking.status)}>
                            {statusText(booking.status)}
                          </BadgeStatus>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {bookings.length > 0 && (
                <div className="border-t p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveSection('bookings')}
                  >
                    View all bookings →
                  </Button>
                </div>
              )}
            </Card>

            {/* Latest Handovers */}
            <Card className="flex flex-col">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Landmark className="h-5 w-5 text-primary" />
                      Latest Handovers
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Recent pickup and return logs
                    </p>
                  </div>
                  <RefreshButton
                    onClick={() => handover.refetch?.()}
                    loading={handover.isLoading ?? false}
                  />
                </div>
              </div>
              <div className="flex-1 divide-y">
                {handover.isLoading ? (
                  <TableLoader />
                ) : handover.data?.data?.data?.length ? (
                  (handover.data.data.data ?? []).slice(0, 5).map((entry) => {
                    return (
                      <div
                        key={entry._id}
                        className="group px-6 py-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold capitalize text-gray-900">
                              {entry.type}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {fmt(entry.createdAt)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>
                              Rental:{' '}
                              {ensureText(
                                entry.rental?.vehicle ?? entry.rental,
                                'Unknown rental'
                              )}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {ensureText(entry.stationId, 'Unknown station')}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Staff: {ensureText(entry.staff, 'unknown')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState message="No handovers recorded." />
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
      {activeSection === 'users' && (
        <div className="space-y-6 pt-6">
          {isAdmin ? (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Create user
                  </h3>
                  <p className="text-sm text-gray-500">
                    Provision admin/staff accounts for internal operations.
                  </p>
                </div>
                <RefreshButton
                  onClick={() => userQuery.refetch()}
                  loading={userQuery.isLoading}
                />
              </div>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleUserSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="userFullName">Full name</Label>
                  <Input id="userFullName" {...userForm.register('fullName')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    {...userForm.register('email')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPhone">Phone</Label>
                  <Input id="userPhone" {...userForm.register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    {...userForm.register('password')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole">Role</Label>
                  <Select
                    value={userForm.watch('role')}
                    onValueChange={(value) =>
                      userForm.setValue('role', value as TUser['role'])
                    }
                  >
                    <SelectTrigger id="userRole">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="renter">Renter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={createUser.isPending}>
                    {createUser.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Create user
                      </>
                    )}
                  </Button>
                </div>
              </form>
              {userFeedback && (
                <p className="mt-4 text-sm text-gray-600">{userFeedback}</p>
              )}
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">All users</h3>
              <p className="text-sm text-gray-600">
                Remove inactive accounts or review staff permissions.
              </p>
            </div>
            <div className="divide-y">
              {userQuery.isLoading ? (
                <TableLoader />
              ) : users.length === 0 ? (
                <EmptyState message="No users were found." />
              ) : (
                users.map((user) => {
                  return (
                    <div
                      key={user._id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.fullName}
                        </p>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user.role} - status: {user.status}
                        </p>
                      </div>
                      {isAdmin ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteUser.isPending}
                          onClick={() => deleteUser.mutate(user._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
      {activeSection === 'stations' && (
        <div className="space-y-6 pt-6">
          {isAdmin ? (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add station
                </h3>
                <RefreshButton
                  onClick={() => stationQuery.refetch()}
                  loading={stationQuery.isLoading}
                />
              </div>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleStationSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="stationCode">Code</Label>
                  <Input id="stationCode" {...stationForm.register('code')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stationName">Name</Label>
                  <Input id="stationName" {...stationForm.register('name')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stationStatus">Status</Label>
                  <Select
                    value={stationForm.watch('status')}
                    onValueChange={(value) =>
                      stationForm.setValue(
                        'status',
                        value as TStation['status']
                      )
                    }
                  >
                    <SelectTrigger id="stationStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={createStation.isPending}>
                    {createStation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add station
                      </>
                    )}
                  </Button>
                </div>
              </form>
              {stationFeedback && (
                <p className="mt-4 text-sm text-gray-600">{stationFeedback}</p>
              )}
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Station directory
              </h3>
            </div>
            <div className="divide-y">
              {stationQuery.isLoading ? (
                <TableLoader />
              ) : stations.length === 0 ? (
                <EmptyState message="No station records found." />
              ) : (
                stations.map((station) => {
                  return (
                    <div
                      key={station._id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {station.name}
                        </p>
                        <p className="text-gray-600">
                          {station.code} - {station.address ?? 'No address'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {station.status}
                        </p>
                      </div>
                      {isAdmin ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteStation.isPending}
                          onClick={() => deleteStation.mutate(station._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
      {activeSection === 'vehicles' && (
        <div className="space-y-6 pt-6">
          {isAdmin ? (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add vehicle
                </h3>
                <RefreshButton
                  onClick={() => vehicleQuery.refetch()}
                  loading={vehicleQuery.isLoading}
                />
              </div>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleVehicleSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="vehicleVin">VIN</Label>
                  <Input id="vehicleVin" {...vehicleForm.register('vin')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleBrand">Brand</Label>
                  <Select
                    value={vehicleForm.watch('brandId')}
                    onValueChange={(value) =>
                      vehicleForm.setValue('brandId', value)
                    }
                  >
                    <SelectTrigger id="vehicleBrand">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate">Plate number</Label>
                  <Input
                    id="vehiclePlate"
                    {...vehicleForm.register('plateNo')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleStation">Station</Label>
                  <Select
                    value={vehicleForm.watch('stationId')}
                    onValueChange={(value) =>
                      vehicleForm.setValue('stationId', value)
                    }
                  >
                    <SelectTrigger id="vehicleStation">
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station._id} value={station._id}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleStatus">Status</Label>
                  <Select
                    value={vehicleForm.watch('status')}
                    onValueChange={(value) =>
                      vehicleForm.setValue(
                        'status',
                        value as TVehicle['status']
                      )
                    }
                  >
                    <SelectTrigger id="vehicleStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleBattery">Battery %</Label>
                  <Input
                    id="vehicleBattery"
                    type="number"
                    min={0}
                    max={100}
                    {...vehicleForm.register('batteryPercent', {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleOdo">Odometer (km)</Label>
                  <Input
                    id="vehicleOdo"
                    type="number"
                    min={0}
                    {...vehicleForm.register('odometer', {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={createVehicle.isPending}>
                    {createVehicle.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add vehicle
                      </>
                    )}
                  </Button>
                </div>
              </form>
              {vehicleFeedback && (
                <p className="mt-4 text-sm text-gray-600">{vehicleFeedback}</p>
              )}
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Fleet inventory
              </h3>
            </div>
            <div className="divide-y">
              {vehicleQuery.isLoading ? (
                <TableLoader />
              ) : vehicles.length === 0 ? (
                <EmptyState message="No vehicles registered." />
              ) : (
                vehicles.map((vehicle) => {
                  const brandLabel =
                    typeof vehicle.brand === 'string'
                      ? vehicle.brand
                      : vehicle.brand?.name;
                  return (
                    <div
                      key={vehicle._id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {brandLabel ?? vehicle.model} ({vehicle.plateNo})
                        </p>
                        <p className="text-gray-600">Model: {vehicle.model}</p>
                        <p className="text-gray-600">
                          VIN {vehicle.vin} - Station {vehicle.stationId}
                        </p>
                        <p className="text-xs text-gray-500">
                          Battery {vehicle.batteryPercent}% - Odo{' '}
                          {vehicle.odometer} km
                        </p>
                      </div>
                      {isAdmin ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteVehicle.isPending}
                          onClick={() => deleteVehicle.mutate(vehicle._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
      {activeSection === 'bookings' && (
        <div className="space-y-6 pt-6">
          {/* Create Booking Form - Admin Only */}
          {isAdmin ? (
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Plus className="h-5 w-5 text-primary" />
                      Create Booking
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create a new booking for customers
                    </p>
                  </div>
                  <RefreshButton
                    onClick={() => bookingQuery.refetch()}
                    loading={bookingQuery.isLoading}
                  />
                </div>
              </div>
              <div className="p-6">
                <form
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  onSubmit={handleBookingSubmit}
                >
                  <div className="space-y-2">
                    <Label htmlFor="bookingRenterName">
                      Renter Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bookingRenterName"
                      {...bookingForm.register('renterName')}
                      placeholder="Enter renter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingPhone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bookingPhone"
                      {...bookingForm.register('phoneNumber')}
                      placeholder="0xxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingEmail">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bookingEmail"
                      type="email"
                      {...bookingForm.register('email')}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingBrand">
                      Brand <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bookingForm.watch('brandId')}
                      onValueChange={(value) =>
                        bookingForm.setValue('brandId', value)
                      }
                    >
                      <SelectTrigger id="bookingBrand">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingStation">
                      Pickup Station <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bookingForm.watch('stationId')}
                      onValueChange={(value) =>
                        bookingForm.setValue('stationId', value)
                      }
                    >
                      <SelectTrigger id="bookingStation">
                        <SelectValue placeholder="Select station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station._id} value={station._id}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingPayment">
                      Payment Method <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bookingForm.watch('paymentMethod')}
                      onValueChange={(value) =>
                        bookingForm.setValue('paymentMethod', value)
                      }
                    >
                      <SelectTrigger id="bookingPayment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="e_wallet">E-Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingPickupDate">
                      Pickup Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bookingPickupDate"
                      type="date"
                      {...bookingForm.register('pickupDate')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingPickupTime">
                      Pickup Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bookingPickupTime"
                      type="time"
                      {...bookingForm.register('pickupTime')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingReturnDate">
                      Return Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bookingReturnDate"
                      type="date"
                      {...bookingForm.register('returnDate')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingReturnTime">
                      Return Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bookingReturnTime"
                      type="time"
                      {...bookingForm.register('returnTime')}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bookingNotes">Notes (Optional)</Label>
                    <Input
                      id="bookingNotes"
                      {...bookingForm.register('notes')}
                      placeholder="Additional notes"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={createBooking.isPending}
                      className="w-full"
                    >
                      {createBooking.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Booking
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                {bookingFeedback && (
                  <div className="mt-4 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                    {bookingFeedback}
                  </div>
                )}
              </div>
            </Card>
          ) : null}

          {/* Update Booking Status - Admin Only */}
          {isAdmin ? (
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Check className="h-5 w-5 text-primary" />
                  Update Booking Status
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Change the status of an existing booking
                </p>
              </div>
              <div className="p-6">
                <form
                  className="grid gap-6 md:grid-cols-3"
                  onSubmit={handleBookingStatusSubmit}
                >
                  <div className="space-y-2">
                    <Label htmlFor="bookingId">
                      Booking ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bookingId"
                      {...bookingStatusForm.register('id')}
                      placeholder="Enter booking ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingUpdateStatus">
                      New Status <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bookingStatusForm.watch('status')}
                      onValueChange={(value) =>
                        bookingStatusForm.setValue('status', value)
                      }
                    >
                      <SelectTrigger id="bookingUpdateStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={updateBooking.isPending}
                      className="w-full"
                    >
                      {updateBooking.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Update Status
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          ) : null}

          {/* All Bookings Table */}
          <Card className="overflow-hidden">
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    All Bookings
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    View and manage all customer bookings
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold">{bookings.length}</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              {bookingQuery.isLoading ? (
                <TableLoader />
              ) : bookings.length === 0 ? (
                <EmptyState message="No bookings found." />
              ) : (
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Renter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Pickup Station
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Pickup Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      {isAdmin ? (
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => {
                      return (
                        <tr
                          key={booking._id}
                          className="transition-colors hover:bg-muted/50"
                        >
                          <td className="px-6 py-4">
                            <div className="font-mono text-xs text-muted-foreground">
                              {booking.bookingCode || booking._id.slice(-8)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {booking.renterName || 'Unknown renter'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                              {booking.brand?.name || 'TBD'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                              {booking.station?.name || booking.pickupStation?.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                              {booking.pickupDate} {booking.pickupTime}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <BadgeStatus variant={mapStatusColor(booking.status)}>
                              {statusText(booking.status)}
                            </BadgeStatus>
                          </td>
                          {isAdmin ? (
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deleteBooking.isPending}
                                onClick={() => deleteBooking.mutate(booking._id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          ) : null}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      )}
      {activeSection === 'rentals' && (
        <div className="space-y-6 pt-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Create rental
              </h3>
              <RefreshButton
                onClick={() => rentalQuery.refetch()}
                loading={rentalQuery.isLoading}
              />
            </div>
            <form
              className="grid gap-4 md:grid-cols-3"
              onSubmit={handleRentalSubmit}
            >
              <div className="space-y-2">
                <Label htmlFor="rentalBooking">Booking ID</Label>
                <Input id="rentalBooking" {...rentalForm.register('booking')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalRenter">Renter (userId)</Label>
                <Input id="rentalRenter" {...rentalForm.register('renter')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalVehicle">Vehicle (id)</Label>
                <Input id="rentalVehicle" {...rentalForm.register('vehicle')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalPickupStation">Pickup station</Label>
                <Input
                  id="rentalPickupStation"
                  {...rentalForm.register('pickupStation')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalReturnStation">Return station</Label>
                <Input
                  id="rentalReturnStation"
                  {...rentalForm.register('returnStation')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalStatus">Status</Label>
                <Select
                  value={rentalForm.watch('status')}
                  onValueChange={(value) =>
                    rentalForm.setValue('status', value)
                  }
                >
                  <SelectTrigger id="rentalStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={createRental.isPending}>
                  {createRental.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Create rental
                    </>
                  )}
                </Button>
              </div>
            </form>
            {rentalFeedback && (
              <p className="mt-4 text-sm text-gray-600">{rentalFeedback}</p>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Rental portfolio
              </h3>
            </div>
            <div className="divide-y">
              {rentalQuery.isLoading ? (
                <TableLoader />
              ) : rentals.length === 0 ? (
                <EmptyState message="No rental records found." />
              ) : (
                rentals.map((rental) => {
                  return (
                    <div
                      key={rental._id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {ensureText(rental.vehicle, 'Unknown vehicle')}
                        </p>
                        <p className="text-gray-600">
                          Renter: {ensureText(rental.renter, 'Unknown renter')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {fmt(rental.pickupTime)} ΓåÆ{' '}
                          {fmt(rental.returnTime ?? undefined)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <BadgeStatus variant={mapStatusColor(rental.status)}>
                          {statusText(rental.status)}
                        </BadgeStatus>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteRental.isPending}
                          onClick={() => deleteRental.mutate(rental._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
      {activeSection === 'payments' && (
        <div className="space-y-6 pt-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Record payment
              </h3>
              <RefreshButton
                onClick={() => paymentQuery.refetch()}
                loading={paymentQuery.isLoading}
              />
            </div>
            <form
              className="grid gap-4 md:grid-cols-3"
              onSubmit={handlePaymentSubmit}
            >
              <div className="space-y-2">
                <Label htmlFor="paymentRental">Rental ID</Label>
                <Input id="paymentRental" {...paymentForm.register('rental')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Method</Label>
                <Select
                  value={paymentForm.watch('method')}
                  onValueChange={(value) =>
                    paymentForm.setValue('method', value)
                  }
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Status</Label>
                <Select
                  value={paymentForm.watch('status')}
                  onValueChange={(value) =>
                    paymentForm.setValue('status', value)
                  }
                >
                  <SelectTrigger id="paymentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentSurcharge">Surcharge amount</Label>
                <Input
                  id="paymentSurcharge"
                  type="number"
                  step="0.01"
                  {...paymentForm.register('surchargeAmount', {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={createPayment.isPending}>
                  {createPayment.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Record payment
                    </>
                  )}
                </Button>
              </div>
            </form>
            {paymentFeedback && (
              <p className="mt-4 text-sm text-gray-600">{paymentFeedback}</p>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment history
              </h3>
            </div>
            <div className="divide-y">
              {paymentQuery.isLoading ? (
                <TableLoader />
              ) : payments.length === 0 ? (
                <EmptyState message="No payment records available." />
              ) : (
                payments.map((payment) => {
                  return (
                    <div
                      key={payment._id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{payment._id}
                        </p>
                        <p className="text-gray-600">
                          {payment.method} - {payment.status}
                        </p>
                        <p className="text-xs text-gray-500">
                          Total: {payment.totalAmount ?? 0} - Surcharge:{' '}
                          {payment.surchargeAmount ?? 0}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletePayment.isPending}
                        onClick={() => deletePayment.mutate(payment._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
      {activeSection === 'documents' && (
        <div className="space-y-6 pt-6">
          <Card className="overflow-hidden">
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <FileText className="h-5 w-5 text-primary" />
                    User Documents Verification
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review and approve customer verification documents
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    Total: <span className="font-semibold">{userDocuments.length}</span>
                  </div>
                  <RefreshButton
                    onClick={() => documentQuery.refetch()}
                    loading={documentQuery.isLoading}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              {documentQuery.isLoading ? (
                <TableLoader />
              ) : userDocuments.length === 0 ? (
                <EmptyState message="No documents submitted yet." />
              ) : (
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Document Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        ID Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userDocuments.map((doc) => {
                      const isPending = doc.status === 'pending';
                      const isVerified = doc.status === 'verified';

                      return (
                        <tr
                          key={doc._id}
                          className="transition-colors hover:bg-muted/50"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {ensureText(doc.user, 'Unknown user')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm capitalize text-muted-foreground">
                              {doc.documentType.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-xs text-muted-foreground">
                              {doc.identityNumber || doc.drivingLicenseNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <BadgeStatus
                              variant={
                                isVerified
                                  ? 'success'
                                  : isPending
                                    ? 'warning'
                                    : 'destructive'
                              }
                            >
                              {statusText(doc.status)}
                            </BadgeStatus>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                              {fmt(doc.submittedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {isPending && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:bg-green-50 hover:text-green-700"
                                    onClick={async () => {
                                      try {
                                        await UserDocumentApi.updateDocument(doc._id, {
                                          status: 'verified',
                                        });
                                        documentQuery.refetch();
                                      } catch (error) {
                                        console.error('Failed to update document', error);
                                      }
                                    }}
                                  >
                                    <Check className="mr-1 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={async () => {
                                      try {
                                        await UserDocumentApi.updateDocument(doc._id, {
                                          status: 'rejected',
                                        });
                                        documentQuery.refetch();
                                      } catch (error) {
                                        console.error('Failed to update document', error);
                                      }
                                    }}
                                  >
                                    <X className="mr-1 h-4 w-4" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await UserDocumentApi.deleteDocument(doc._id);
                                      documentQuery.refetch();
                                    } catch (error) {
                                      console.error('Failed to delete document', error);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          {/* Document Statistics */}
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              label="Pending Review"
              value={userDocuments.filter((d) => d.status === 'pending').length}
              meta="Documents awaiting approval"
              icon={Loader2}
            />
            <StatCard
              label="Verified"
              value={userDocuments.filter((d) => d.status === 'verified').length}
              meta="Approved documents"
              icon={Check}
            />
            <StatCard
              label="Rejected"
              value={userDocuments.filter((d) => d.status === 'rejected').length}
              meta="Declined documents"
              icon={X}
            />
          </div>
        </div>
      )}
      {activeSection === 'brands' && (
        <div className="space-y-6 pt-6">
          {isAdmin ? (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create brand
                </h3>
                <RefreshButton
                  onClick={() => brandQuery.refetch()}
                  loading={brandQuery.isLoading}
                />
              </div>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleBrandSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="brandCode">Code</Label>
                  <Input id="brandCode" {...brandForm.register('code')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandName">Name</Label>
                  <Input id="brandName" {...brandForm.register('name')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandRate">Daily rate</Label>
                  <Input
                    id="brandRate"
                    type="number"
                    step="0.01"
                    {...brandForm.register('baseDailyRate', {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandDeposit">Deposit</Label>
                  <Input
                    id="brandDeposit"
                    type="number"
                    step="0.01"
                    {...brandForm.register('depositAmount', {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="brandDescription">Description</Label>
                  <Textarea
                    id="brandDescription"
                    {...brandForm.register('description')}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={createBrand.isPending}>
                    {createBrand.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Create brand
                      </>
                    )}
                  </Button>
                </div>
              </form>
              {brandFeedback && (
                <p className="mt-4 text-sm text-gray-600">{brandFeedback}</p>
              )}
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Brand catalog
              </h3>
            </div>
            <div className="divide-y">
              {brandQuery.isLoading ? (
                <TableLoader />
              ) : brands.length === 0 ? (
                <EmptyState message="No brand data." />
              ) : (
                brands.map((brand) => {
                  return (
                    <div
                      key={brand._id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {brand.name} ({brand.code})
                        </p>
                        <p className="text-gray-600">
                          Rate: {brand.baseDailyRate} - Deposit:{' '}
                          {brand.depositAmount}
                        </p>
                        <p className="text-xs text-gray-500">
                          {brand.description ?? 'No description'}
                        </p>
                      </div>
                      {isAdmin ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteBrand.isPending}
                          onClick={() => deleteBrand.mutate(brand._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};
const StatCard = ({
  label,
  value,
  meta,
  action,
  icon,
  trend,
}: {
  label: string;
  value: number | string | React.ReactNode;
  meta?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  trend?: { value: number; positive: boolean };
}) => {
  const Icon = icon;
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              {typeof value === 'string' || typeof value === 'number' ? (
                <>
                  <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                  {trend && (
                    <span
                      className={cn(
                        'text-xs font-medium',
                        trend.positive ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {trend.positive ? '+' : ''}
                      {trend.value}%
                    </span>
                  )}
                </>
              ) : (
                <div className="w-full">{value}</div>
              )}
            </div>
            {meta && (
              <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        {action && <div className="mt-4">{action}</div>}
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/20 to-primary" />
    </Card>
  );
};

const TableLoader = () => (
  <div className="flex items-center justify-center py-12 text-gray-600">
    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
    Loading data...
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center py-12 text-sm text-gray-500">
    {message}
  </div>
);

const RefreshButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => (
  <Button size="sm" variant="outline" onClick={onClick} disabled={loading}>
    <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />{' '}
    Refresh
  </Button>
);

export default AdminDashboard;
