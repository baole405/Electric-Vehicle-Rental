
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Search, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderMainProps {
  title?: string;
}

export default function HeaderMain({ title }: HeaderMainProps) {
  return (
    <header className="bg-black text-white px-6 py-3 flex items-center justify-between gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-5 h-5 bg-red-600 rounded-full" />
        <span className="text-yellow-400 font-bold text-xl tracking-wide">ERV</span>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1 flex-1 max-w-lg">
        <Search className="text-gray-500 w-5 h-5" />
        <Input
          type="text"
          placeholder="Tìm xe điện..."
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black placeholder:text-gray-500 w-full"
        />
      </div>

      {/* Icon góc phải */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-yellow-400 hover:bg-transparent"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Link to="/user/profile" className="flex items-center gap-2">
          <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden md:inline font-medium">User</span>
        </Link>
      </div>
    </header>
  );
}
