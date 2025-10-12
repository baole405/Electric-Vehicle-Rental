import { Button } from "@/components/Shadcn/ui/button";
import { Separator } from "@/components/Shadcn/ui/separator";
import { SidebarTrigger } from "@/components/Shadcn/ui/sidebar";
import { ROUTES } from "@/routes/route.constants";

export function SiteHeader() {
  return (
    <header className="h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />{" "}
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a href={ROUTES.HOME} className="dark:text-foreground">
              Trang chủ
            </a>
          </Button>
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a href="https://git.fa.edu.vn/hcm25_cpl_react_05/fe_team_5" rel="noopener noreferrer" target="_blank" className="dark:text-foreground">
              Gitlab
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
