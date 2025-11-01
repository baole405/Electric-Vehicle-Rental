import { useEffect, useMemo, useRef } from "react";
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
  const { currentUser, role, clearAuth } = useAuthContext();
  const effectiveRole = role ?? currentUser?.role;
  const isStaff = effectiveRole === "admin" || effectiveRole === "staff";
  const previousUserIdRef = useRef<string | null>(null);

  const navLinks = useMemo(() => {
    if (!isStaff) return NAV_LINKS;
    const workspaceLink = { to: ROUTES.DASHBOARD, label: "Workspace" };
    const combined = [...NAV_LINKS];
    combined.splice(1, 0, workspaceLink);
    return combined;
  }, [isStaff]);

  useEffect(() => {
    if (!currentUser && (pathname.startsWith(ROUTES.DASHBOARD) || pathname.startsWith(ROUTES.PROFILE))) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [currentUser, navigate, pathname]);

  useEffect(() => {
    const currentId = currentUser?._id ?? null;
    const previousId = previousUserIdRef.current;
    const shouldRedirect = effectiveRole === "admin" || effectiveRole === "staff";

    if (!currentId) {
      previousUserIdRef.current = null;
      return;
    }

    if (
      shouldRedirect &&
      previousId &&
      previousId !== currentId &&
      !pathname.startsWith(ROUTES.DASHBOARD)
    ) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }

    previousUserIdRef.current = currentId;
  }, [currentUser?._id, effectiveRole, navigate, pathname]);

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link to={ROUTES.ROOT} className="flex items-center transition hover:opacity-80">
  <img
    src="/logo.jpg"
    alt="EVrent"
    className="h-10 w-10 rounded-md object-cover shadow-md"
  />
</Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "text-sm font-medium text-gray-600 transition-colors hover:text-[#00CC66]",
                pathname.startsWith(item.to) && "text-[#00CC66]",
              )}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-2 lg:flex">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vehicles, stations..."
              className="w-72 rounded-md border border-gray-300 bg-white pl-8 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:border-[#00CC66] focus:ring-[#00CC66]"
            />
          </div>
        </div>

        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 flex items-center gap-2 transition hover:opacity-90">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00CC66] text-sm font-bold text-white shadow-md">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-gray-700 md:inline">
                  {currentUser.fullName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              {isStaff && (
                <DropdownMenuItem onClick={() => navigate(ROUTES.DASHBOARD)}>
                  Workspace
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:border-[#00CC66] hover:text-[#00CC66]"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Sign in
            </Button>
            <Button
              size="sm"
              className="bg-[#00CC66] text-white hover:bg-[#00b85c]"
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              Register
            </Button>
          </div>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-gray-600 hover:text-[#00CC66]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-8 rounded-md border border-gray-300 text-sm text-gray-700 placeholder-gray-400 focus:border-[#00CC66] focus:ring-[#00CC66]"
                />
              </div>
              <div className="flex flex-col gap-3">
                {navLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "text-base text-gray-600 hover:text-[#00CC66] transition",
                      pathname.startsWith(item.to) && "font-medium text-[#00CC66]",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t pt-4">
                  {currentUser ? (
                    <>
                      {isStaff && (
                        <button
                          onClick={() => navigate(ROUTES.DASHBOARD)}
                          className="block w-full py-1.5 text-left text-gray-600 hover:text-[#00CC66]"
                        >
                          Workspace
                        </button>
                      )}
                      <button
                        onClick={() => navigate(ROUTES.PROFILE)}
                        className="block w-full py-1.5 text-left text-gray-600 hover:text-[#00CC66]"
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:border-[#00CC66] hover:text-[#00CC66]"
                        onClick={() => navigate(ROUTES.LOGIN)}
                      >
                        Sign in
                      </Button>
                                            <Button
                        size="sm"
                        className="bg-[#00CC66] text-white hover:bg-[#00b85c]"
                        onClick={() => navigate(ROUTES.REGISTER)}
                      >
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


