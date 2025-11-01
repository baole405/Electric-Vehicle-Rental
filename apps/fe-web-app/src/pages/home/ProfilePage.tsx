import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HeaderMain from "@/components/header/header-main";
import { Card } from "@/components/shadcn/ui/card";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { useAuthContext } from "@/contexts/auth-context";
import { useUserHook } from "@/hooks/use-user";
import { useUserDocument } from "@/hooks/use-user-document";
import { useBooking } from "@/hooks/use-booking";
import { useRentalHook } from "@/hooks/use-rental";
import { usePaymentHook } from "@/hooks/use-payment";
import { BadgeStatus, fmt, mapStatusColor, money, statusText } from "@/lib/utils";
import { ROUTES } from "@/routes/route.constants";
import type { TBooking } from "@/schema/booking.schema";
import type { TRental } from "@/schema/rental.schema";
import type { TPayment } from "@/schema/payment.schema";
import type { TUserDocument } from "@/schema/user-document.schema";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser, isVerified } = useAuthContext();
  const userId = currentUser?._id ?? "";

  const { useUserById } = useUserHook();
  const userQuery = useUserById(userId, { enabled: Boolean(userId) });
  const { data: documentResponse, isLoading: documentLoading } = useUserDocument(userId || undefined);

  const { useBookingList } = useBooking();
  const { useRentalList } = useRentalHook();
  const { usePaymentList } = usePaymentHook();

  const bookingQuery = useBookingList();
  const rentalQuery = useRentalList();
  const paymentQuery = usePaymentList();

  const userFromQuery = userQuery.data?.data?.data;
  const document = useMemo<TUserDocument | undefined>(
    () => (documentResponse?.data?.data ?? [])[0],
    [documentResponse?.data?.data],
  );

  const documentStatus = document?.status ?? "pending";
  const documentStatusText = documentStatus.replace("_", " ");
  const canBook = documentStatus === "verified";

  const bookings = (bookingQuery.data?.data?.data ?? []) as TBooking[];
  const rentals = (rentalQuery.data?.data?.data ?? []) as TRental[];
  const payments = (paymentQuery.data?.data?.data ?? []) as TPayment[];

  const targetUserId = currentUser?._id ?? "";
  const myBookings = bookings.filter((booking) => booking.renter?._id === targetUserId);
  const myRentals = rentals.filter((rental) => rental.renter?._id === targetUserId);
  const myPayments = payments.filter((payment) => payment.rental?.renter?._id === targetUserId);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <HeaderMain title="Profile" />
        <div className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md space-y-4 p-6 text-center border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900">Join EVrent</h2>
            <p className="text-sm text-gray-600">
              Create an account and upload your documents to view booking history and manage rentals.
            </p>
            <Button className="w-full bg-[#00CC66] hover:bg-[#00b85c] text-white" onClick={() => navigate(ROUTES.REGISTER)}>
              Register now
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const user = userFromQuery ?? currentUser;

  return (
    <div className="min-h-screen bg-white pb-10">
      <HeaderMain title="Profile" />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 lg:grid-cols-[1fr,2fr]">
        {/* Left column */}
        <div className="space-y-4">
          {/* Profile card */}
          <Card className="space-y-4 p-6 border border-gray-100 shadow-sm rounded-xl">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">{user.role}</Badge>
              <Badge variant={isVerified ? "default" : "outline"}>
                {isVerified ? "Verified renter" : "Pending verification"}
              </Badge>
              <Badge variant="outline">Joined {fmt(user.createdAt)}</Badge>
            </div>
            <dl className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt>Phone</dt>
                <dd className="font-medium">{user.phone ?? "Not provided"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>User status</dt>
                <dd className="font-medium">{user.status}</dd>
              </div>
            </dl>
            <Button variant="outline" className="w-full hover:border-[#00CC66] hover:text-[#00CC66]" onClick={() => refreshUser()}>
              Refresh profile
            </Button>
          </Card>

          {/* Document card */}
          <Card className="space-y-4 p-6 border border-gray-100 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Document verification</h3>
                <p className="text-sm text-gray-600">
                  Upload your ID and driving license to unlock bookings.
                </p>
              </div>
              <BadgeStatus variant={canBook ? "green" : "amber"}>{documentStatusText}</BadgeStatus>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Last updated:{" "}
                {documentLoading
                  ? "Loading..."
                  : document?.updatedAt
                    ? fmt(document.updatedAt)
                    : "Not submitted"}
              </p>
              <p>
                Reviewed by:{" "}
                {document?.verifiedBy?.fullName ?? "Awaiting staff review"}
              </p>
            </div>
            <Button
              className={`w-full ${canBook ? "bg-white border border-gray-300 text-gray-800 hover:border-[#00CC66] hover:text-[#00CC66]" : "bg-[#00CC66] text-white hover:bg-[#00b85c]"}`}
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              {canBook ? "Update documents" : "Submit documents"}
            </Button>
          </Card>
        </div>

        {/* Right column */}
        <Card className="p-6 border border-gray-100 shadow-sm rounded-xl">
          <Tabs defaultValue="bookings">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="rentals">Rentals</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-6 space-y-3">
              <HistoryState
                isLoading={bookingQuery.isLoading}
                isError={bookingQuery.isError}
                emptyText="You have not created any booking requests yet."
                items={myBookings.map((booking) => ({
                  id: booking._id,
                  title: booking.vehicle?.model ?? "Vehicle booking",
                  status: booking.status,
                  meta: [
                    `Pickup: ${fmt(booking.pickupTimeExpected)}`,
                    `Station: ${booking.pickupStation?.name ?? "Unknown"}`,
                  ],
                }))}
              />
            </TabsContent>

            <TabsContent value="rentals" className="mt-6 space-y-3">
              <HistoryState
                isLoading={rentalQuery.isLoading}
                isError={rentalQuery.isError}
                emptyText="No rentals recorded."
                items={myRentals.map((rental) => ({
                  id: rental._id,
                  title: rental.vehicle?.model ?? "Rental",
                  status: rental.status,
                  meta: [
                    `Pickup: ${fmt(rental.pickupTime)}`,
                    `Return: ${fmt(rental.returnTime ?? undefined)}`,
                    `Stations: ${rental.pickupStation?.name ?? "-"} -> ${rental.returnStation?.name ?? "-"}`,
                  ],
                }))}
              />
            </TabsContent>

                        <TabsContent value="payments" className="mt-6 space-y-3">
              <HistoryState
                isLoading={paymentQuery.isLoading}
                isError={paymentQuery.isError}
                emptyText="No payment records yet."
                items={myPayments.map((payment) => ({
                  id: payment._id,
                  title: payment.rental?.vehicle?.model ?? "Payment",
                  status: payment.status,
                  meta: [
                    `Amount: ${money(payment.totalAmount)}`,
                    `Created: ${fmt(payment.createdAt)}`,
                  ],
                }))}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

// Reusable history display component
const HistoryState = ({
  isLoading,
  isError,
  emptyText,
  items,
}: {
  isLoading: boolean;
  isError: boolean;
  emptyText: string;
  items: { id: string; title: string; status: string; meta: string[] }[];
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-red-500">
        Failed to load data. Please refresh.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="p-4 border border-gray-100 shadow-sm rounded-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <div className="mt-1 space-y-1 text-xs text-gray-600">
                {item.meta.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
            <BadgeStatus variant={mapStatusColor(item.status)}>
              {statusText(item.status) || item.status}
            </BadgeStatus>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProfilePage;

