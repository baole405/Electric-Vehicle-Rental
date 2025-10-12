import FCinemaLogo from "@/assets/FCinema_Logo.webp";
import { NavUser } from "@/components/Shadcn/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/Shadcn/ui/sidebar";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";

type SidebarData = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navMain: {
    title: string;
    url: string;
    icon: React.ElementType;
    items?: { title: string; url: string; icon: React.ElementType }[];
  }[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { data: SidebarData }) {
  const { data } = props;
  const location = useLocation();
  const { open, setOpen } = useSidebar();

  // Function to check if a menu item is active
  const isActive = (itemUrl: string) => {
    // Remove trailing slash if present
    const currentPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname;
    const url = itemUrl.endsWith("/") ? itemUrl.slice(0, -1) : itemUrl;

    // Check if current path exactly matches the URL
    if (currentPath === url) return true;

    // Check if current path starts with the URL and the next character is '/'
    if (currentPath.startsWith(url) && (currentPath.length === url.length || currentPath[url.length] === "/")) {
      return true;
    }

    return false;
  };

  // Function to handle menu item click and open sidebar
  const handleMenuItemClick = () => {
    setOpen(true);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/admin/dashboard">
                <img src={FCinemaLogo} alt="FCinema Logo" className="!size-5" />
                <span className="text-base font-semibold">FCinema Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items?.length ? (
                  // If the item has subitems, it should be a category header
                  <SidebarMenuButton tooltip={item.title} className="cursor-default" onClick={handleMenuItemClick}>
                    <item.icon />
                    {item.title}
                  </SidebarMenuButton>
                ) : (
                  // Regular clickable item
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground hover:bg-primary/50 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                        : ""
                    }
                    onClick={handleMenuItemClick}
                  >
                    <Link to={item.url} className="font-medium">
                      <item.icon />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                )}
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={
                            isActive(subItem.url)
                              ? "bg-primary text-primary-foreground hover:bg-primary/50 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                              : ""
                          }
                          onClick={handleMenuItemClick}
                        >
                          <Link to={subItem.url}>
                            <subItem.icon />
                            {subItem.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
