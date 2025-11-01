import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { useAuthContext } from '@/contexts/auth-context';
import { ROUTES } from '@/routes/route.constants';
import { cn } from '@/lib/utils';

export type DashboardNavItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  roles?: Array<'admin' | 'staff' | 'renter'>;
};

export type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  menuItems: DashboardNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  children: ReactNode;
};

const DashboardLayout = ({
  title,
  subtitle,
  menuItems,
  activeKey,
  onSelect,
  children,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { currentUser, role, clearAuth } = useAuthContext();

  const effectiveRole = role ?? currentUser?.role ?? 'renter';
  const displayName = currentUser?.fullName ?? 'User';

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(effectiveRole)
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white shadow-sm md:flex">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-base font-bold text-white shadow-md">
              EV
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">EVrent Ops</div>
              <div className="text-xs text-muted-foreground">Staff Dashboard</div>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4 text-sm">
          {visibleItems.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-all',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                )}
              >
                {item.icon ? (
                  <span
                    className={cn(
                      'text-base transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-gray-500'
                    )}
                    aria-hidden
                  >
                    {item.icon}
                  </span>
                ) : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t bg-muted/30 p-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-xs text-muted-foreground">Signed in as</div>
            <div className="mt-1 font-semibold text-gray-900">{displayName}</div>
            <div className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">
              {effectiveRole}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-5 md:px-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.HOME)}
                className="transition-all hover:shadow-md"
              >
                <Menu className="mr-2 h-4 w-4" aria-hidden />
                Home
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="transition-all hover:shadow-md"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
