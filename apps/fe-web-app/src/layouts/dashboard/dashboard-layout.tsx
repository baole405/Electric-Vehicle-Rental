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
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r bg-white p-6 md:flex">
        <div className="mb-8 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            EV
          </div>
          EVrent Ops
        </div>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {visibleItems.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-left font-medium transition hover:bg-primary/10',
                  isActive ? 'bg-primary/10 text-primary' : 'text-gray-700'
                )}
              >
                {item.icon ? (
                  <span className="text-base" aria-hidden>
                    {item.icon}
                  </span>
                ) : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
          Signed in as <strong>{displayName}</strong>
          <div className="mt-1 capitalize text-gray-500">{effectiveRole}</div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm md:px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-gray-500">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.HOME)}
            >
              <Menu className="mr-2 h-4 w-4" aria-hidden />
              Home
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
              Logout
            </Button>
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
