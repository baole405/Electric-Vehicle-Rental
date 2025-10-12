import { IconDotsVertical, IconHome, IconLogout, IconUserCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/Shadcn/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/Shadcn/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/Shadcn/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useGetUserById } from "@/services/userService";
import { getCookie } from "@/utils/cookie.utils";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, authLogout } = useAuth();
  const navigate = useNavigate();

  // Get user ID from cookies or context
  const userId = user?.id || getCookie("user_id");
  const fullName = user?.fullName || getCookie("fullName");

  // Query user details by ID
  const { data: userDetails } = useGetUserById(userId || "");

  const handleLogout = () => {
    authLogout();
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  const handleNavigateAccount = () => {
    navigate("/account");
  };

  // Use real user data or fallback to cookie data
  const displayName = userDetails?.result?.fullName || fullName || "User";
  const displayEmail = userDetails?.result?.email || "user@fcinema.com";
  const displayAvatar = userDetails?.result?.avatar || "https://ui.shadcn.com/avatars/shadcn.jpg";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              data-testid="admin-menu-trigger"
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg p-0">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">{displayEmail}</span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg p-0">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleNavigateHome}>
                <IconHome />
                Homepage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNavigateAccount}>
                <IconUserCircle className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
