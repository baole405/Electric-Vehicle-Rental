import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Mail,
  Phone,
  RefreshCcw,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { apiBaseUrl, apiFetch } from "@/lib/api-client";

type UserStatus = "active" | "inactive" | "pending" | string;
type UserRole = "admin" | "staff" | "renter" | string;

type User = {
  _id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

type ApiListResponse<T> = {
  data: T;
};

const STATUS_COLOR: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  staff: "Staff",
  renter: "Renter",
};

function getStatusStyle(status: UserStatus) {
  return STATUS_COLOR[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

function getRoleLabel(role: UserRole) {
  return ROLE_LABEL[role] ?? role;
}

export default function UsersPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch<ApiListResponse<User[]>>("/users"),
    staleTime: 60_000,
  });

  const users = data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Users directory
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Data fetched from&nbsp;
              <span className="font-mono text-xs text-primary">
                {apiBaseUrl}/users
              </span>
              .
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <UsersBadge />
                Registered users
              </CardTitle>
              <CardDescription>
                The backend seeds a few demo accounts for quick testing.
              </CardDescription>
            </div>
            <span className="text-sm text-gray-500">
              Total: {users.length}
            </span>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner label="Loading users..." fullHeight={false} />
              </div>
            ) : isError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error instanceof Error ? error.message : "Failed to load"}
              </div>
            ) : users.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                No users found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium text-gray-900">
                        {user.fullName}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {user.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                          <UserRound className="h-3 w-3 text-gray-500" />
                          {getRoleLabel(user.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                            user.status,
                          )}`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      <BadgeCheck className="h-3.5 w-3.5" />
      Live API
    </span>
  );
}
