import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/shadcn/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth-context";
import { ROUTES } from "@/routes/route.constants";

interface HeaderMainProps {
  title?: string;
}

const NAV_LINKS = [
  { to: ROUTES.VEHICLE, label: "Electric Fleet" },
  { to: "/stations", label: "Stations" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
];

export default function HeaderMain(_: HeaderMainProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, clearAuth } = useAuthContext();
  const isStaff = currentUser?.role === "admin" || currentUser?.role === "staff";
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUser && (pathname.startsWith(ROUTES.DASHBOARD) || pathname.startsWith(ROUTES.PROFILE))) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [currentUser, navigate, pathname]);

  useEffect(() => {
    const currentId = currentUser?._id ?? null;
    const previousId = previousUserIdRef.current;
    const shouldRedirect = currentUser && (currentUser.role === "admin" || currentUser.role === "staff");

    if (shouldRedirect && currentId && previousId !== currentId && !pathname.startsWith(ROUTES.DASHBOARD)) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }

    previousUserIdRef.current = currentId;
  }, [currentUser, navigate, pathname]);

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.ROOT);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        <Link to={ROUTES.ROOT} className="flex items-center gap-2 transition hover:opacity-80">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-red-500 text-[10px] font-extrabold text-white shadow">
            EV
          </div>
          <span className="text-lg font-bold text-gray-800">EVrent</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "text-sm text-gray-700 transition-colors hover:text-black",
                pathname.startsWith(item.to) && "font-semibold text-black",
              )}
            >
              {item.label}
            </NavLink>
          ))}
          {isStaff ? (
            <NavLink
              to={ROUTES.DASHBOARD}
              className={cn(
                "text-sm text-gray-700 transition-colors hover:text-black",
                pathname.startsWith(ROUTES.DASHBOARD) && "font-semibold text-black",
              )}
            >
              Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-2 lg:flex">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search vehicles, stations." className="w-72 pl-8" />
          </div>
        </div>

        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 flex items-center gap-2 transition hover:opacity-90">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-gray-700 md:inline">
                  {currentUser.fullName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
              Register
            </Button>
          </div>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search." className="pl-8" />
              </div>
              <div className="flex flex-col gap-3">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "text-base text-gray-700 hover:text-black",
                      pathname.startsWith(item.to) && "font-medium text-black",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {isStaff ? (
                  <Link
                    to={ROUTES.DASHBOARD}
                    className={cn(
                      "text-base text-gray-700 hover:text-black",
                      pathname.startsWith(ROUTES.DASHBOARD) && "font-medium text-black",
                    )}
                  >
                    Dashboard
                  </Link>
                ) : null}
                <div className="border-t pt-4">
                  {currentUser ? (
                    <>
                      <button
                        onClick={() => navigate(ROUTES.PROFILE)}
                        className="block w-full py-1.5 text-left text-gray-700 hover:text-black"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full py-1.5 text-left text-red-600 hover:text-red-700"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
                        Sign in
                      </Button>
                      <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
                        Register
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

