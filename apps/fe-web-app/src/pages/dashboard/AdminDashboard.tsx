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
import type { TBooking } from '@/schema/booking.schema';
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
  renter: string;
  pickupStation: string;
  pickupTimeExpected: string;
  vehicle?: string;
  status: string;
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
        (booking) => booking.status === 'pending'
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
      renter: '',
      pickupStation: '',
      pickupTimeExpected: new Date().toISOString().slice(0, 16),
      vehicle: '',
      status: 'pending',
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
        renter: values.renter,
        vehicle: values.vehicle ? values.vehicle : undefined,
        pickupStation: values.pickupStation,
        pickupTimeExpected: new Date(values.pickupTimeExpected).toISOString(),
        status: values.status as TBooking['status'],
      });
      setBookingFeedback('Booking created.');
      bookingForm.reset({
        renter: '',
        pickupStation: '',
        pickupTimeExpected: new Date().toISOString().slice(0, 16),
        vehicle: '',
        status: 'pending',
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
          <section className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Vehicles"
              value={stats.totalVehicles}
              meta={`${stats.availableVehicles} available`}
            />
            <StatCard
              label="Active rentals"
              value={stats.activeRentals}
              meta="Ongoing handovers"
            />
            <StatCard
              label="Pending bookings"
              value={stats.pendingBookings}
              meta="Awaiting approval"
            />
            <StatCard
              label="Refresh data"
              value="Manual"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    vehicleQuery.refetch();
                    bookingQuery.refetch();
                    rentalQuery.refetch();
                    stationQuery.refetch();
                    handover.refetch?.();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              }
            />
          </section>

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent bookings
              </h3>
              <p className="text-sm text-gray-600">
                Track incoming bookings and contact renters before creating a
                handover.
              </p>
            </div>
            <div className="divide-y">
              {bookingQuery.isLoading ? (
                <TableLoader />
              ) : bookings.length === 0 ? (
                <EmptyState message="No bookings at the moment." />
              ) : (
                bookings.slice(0, 6).map((booking) => {
                  return (
                    <div
                      key={booking._id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {ensureText(booking.renter, 'Unknown renter')}
                        </p>
                        <p className="text-gray-600">
                          Pickup at{' '}
                          <span className="font-medium">
                            {ensureText(
                              booking.pickupStation,
                              'Unknown station'
                            )}
                          </span>
                          {' on '}
                          {fmt(booking.pickupTimeExpected)}
                        </p>
                        <p className="text-gray-500">
                          Vehicle: {ensureText(booking.vehicle, 'TBD')} - ID:{' '}
                          {booking._id}
                        </p>
                      </div>
                      <BadgeStatus variant={mapStatusColor(booking.status)}>
                        {statusText(booking.status)}
                      </BadgeStatus>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Latest handovers
              </h3>
              <p className="text-sm text-gray-600">
                Quick view of recent pickup / return logs.
              </p>
            </div>
            <div className="divide-y">
              {handover.isLoading ? (
                <TableLoader />
              ) : handover.data?.data?.data?.length ? (
                (handover.data.data.data ?? []).slice(0, 5).map((entry) => {
                  return (
                    <div
                      key={entry._id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {entry.type}
                        </p>
                        <p className="text-gray-600">
                          Rental:{' '}
                          {ensureText(
                            entry.rental?.vehicle ?? entry.rental,
                            'Unknown rental'
                          )}{' '}
                          - {fmt(entry.createdAt)}
                        </p>
                        <p className="text-gray-500">
                          Station:{' '}
                          {ensureText(entry.stationId, 'Unknown station')} -
                          Staff: {ensureText(entry.staff, 'unknown')}
                        </p>
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
          {isAdmin ? (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create booking
                </h3>
                <RefreshButton
                  onClick={() => bookingQuery.refetch()}
                  loading={bookingQuery.isLoading}
                />
              </div>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleBookingSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="bookingRenter">Renter (userId)</Label>
                  <Input
                    id="bookingRenter"
                    {...bookingForm.register('renter')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingStation">Pickup station</Label>
                  <Input
                    id="bookingStation"
                    {...bookingForm.register('pickupStation')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingVehicle">Vehicle (optional)</Label>
                  <Input
                    id="bookingVehicle"
                    {...bookingForm.register('vehicle')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingTime">Pickup time</Label>
                  <Input
                    id="bookingTime"
                    type="datetime-local"
                    {...bookingForm.register('pickupTimeExpected')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingStatus">Status</Label>
                  <Select
                    value={bookingForm.watch('status')}
                    onValueChange={(value) =>
                      bookingForm.setValue('status', value)
                    }
                  >
                    <SelectTrigger id="bookingStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={createBooking.isPending}>
                    {createBooking.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Create booking
                      </>
                    )}
                  </Button>
                </div>
              </form>
              {bookingFeedback && (
                <p className="mt-4 text-sm text-gray-600">{bookingFeedback}</p>
              )}
            </Card>
          ) : null}

          {isAdmin ? (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Update booking status
              </h3>
              <form
                className="grid gap-4 md:grid-cols-3"
                onSubmit={handleBookingStatusSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="bookingId">Booking ID</Label>
                  <Input id="bookingId" {...bookingStatusForm.register('id')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingUpdateStatus">Status</Label>
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
                  <Button type="submit" disabled={updateBooking.isPending}>
                    {updateBooking.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" /> Update
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                All bookings
              </h3>
            </div>
            <div className="divide-y">
              {bookingQuery.isLoading ? (
                <TableLoader />
              ) : bookings.length === 0 ? (
                <EmptyState message="No bookings found." />
              ) : (
                bookings.map((booking) => {
                  return (
                    <div
                      key={booking._id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking._id}
                        </p>
                        <p className="text-gray-600">
                          Renter: {ensureText(booking.renter, 'Unknown renter')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {booking.status} - Vehicle:{' '}
                          {ensureText(booking.vehicle, 'TBD')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <BadgeStatus variant={mapStatusColor(booking.status)}>
                          {statusText(booking.status)}
                        </BadgeStatus>
                        {isAdmin ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteBooking.isPending}
                            onClick={() => deleteBooking.mutate(booking._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
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
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                User documents
              </h3>
              <p className="text-sm text-gray-600">
                Approve or reject renter verification documents.
              </p>
            </div>
            <div className="divide-y">
              {documentQuery.isLoading ? (
                <TableLoader />
              ) : userDocuments.length === 0 ? (
                <EmptyState message="No documents submitted yet." />
              ) : (
                userDocuments.map((doc) => {
                  return (
                    <div
                      key={doc._id}
                      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {ensureText(doc.user, 'Unknown user')} -{' '}
                          {doc.documentType}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {doc.status} - Submitted:{' '}
                          {fmt(doc.submittedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
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
                          <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
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
                          <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        {isAdmin ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              try {
                                await UserDocumentApi.deleteDocument(doc._id);
                                documentQuery.refetch();
                              } catch (error) {
                                console.error(
                                  'Failed to delete document',
                                  error
                                );
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
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
}: {
  label: string;
  value: number | string;
  meta?: string;
  action?: React.ReactNode;
}) => (
  <Card className="flex flex-col gap-2 p-6">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
    {meta && <div className="text-xs text-gray-500">{meta}</div>}
    {action}
  </Card>
);

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
