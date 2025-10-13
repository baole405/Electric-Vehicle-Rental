import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/shadcn/ui/sheet";
import { Menu, ChevronDown, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface HeaderMainProps {
  title?: string;
}

const nav = [
  { to: "/vehicles", label: "Electric Fleet" },
  { to: "/stations", label: "Stations" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function HeaderMain(_: HeaderMainProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // 🧠 Giả lập user (nếu có API thật thì thay thế bằng Zustand hoặc Redux)
  const user = {
    name: "Như Quỳnh",
    role: "customer",
  };

  // 🔒 Hàm logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  // 🔁 Nếu chưa đăng nhập thì có thể redirect hoặc hiển thị nút login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && pathname.startsWith("/dashboard")) {
      navigate("/login");
    }
  }, [pathname, navigate]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center text-white font-extrabold text-[10px] shadow">
            ⚡
          </div>
          <span className="font-bold text-lg text-gray-800">EVrent</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 ml-6">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={cn(
                "text-sm text-gray-700 hover:text-black transition-colors",
                pathname.startsWith(n.to) && "text-black font-semibold"
              )}
            >
              {n.label}
            </NavLink>
          ))}

          {/* Dropdown cho API */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-black">
                API <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              <Link to="/api/docs">
                <DropdownMenuItem>Docs</DropdownMenuItem>
              </Link>
              <Link to="/api/playground">
                <DropdownMenuItem>Playground</DropdownMenuItem>
              </Link>
              <Link to="/api/keys">
                <DropdownMenuItem>API Keys</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex-1" />

        {/* Search desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search vehicles, stations…"
              className="pl-8 w-72"
            />
          </div>
        </div>

        {/* Dropdown user */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-2 hover:opacity-90">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user.name}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <Input placeholder="Search…" className="pl-8" />
              </div>
              <div className="flex flex-col gap-3">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "text-base text-gray-700 hover:text-black",
                      pathname.startsWith(n.to) && "text-black font-medium"
                    )}
                  >
                    {n.label}
                  </Link>
                ))}
                <div className="pt-2 border-t">
                  <div className="text-xs uppercase text-gray-400 mb-2">API</div>
                  <Link
                    to="/api/docs"
                    className="block py-1.5 text-gray-700 hover:text-black"
                  >
                    Docs
                  </Link>
                  <Link
                    to="/api/playground"
                    className="block py-1.5 text-gray-700 hover:text-black"
                  >
                    Playground
                  </Link>
                </div>
                <div className="pt-4 border-t">
                  <button
                    onClick={() => navigate("/profile")}
                    className="block w-full text-left text-gray-700 hover:text-black py-1.5"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-600 hover:text-red-700 py-1.5"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
