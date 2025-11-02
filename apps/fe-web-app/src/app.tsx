import "@/app.css";
import { AppRoutes } from "@/routes/route.index";
import { Toaster } from "@/components/shadcn/ui/sonner";

const TITLE = "EV Rental";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <title>{TITLE}</title>
      <AppRoutes />
      <Toaster />
    </div>
  );
}

export default App;
