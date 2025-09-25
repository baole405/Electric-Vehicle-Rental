import "@/app.css";
import { AppRoutes } from "@/routes/route.index";
import { Toaster } from "@/components/Shadcn/ui/sonner";

const TITLE = "Ev-Rental";

function App() {
  return (
      <div>
        <title>{TITLE}</title>
          <Toaster position="top-right" />
          <AppRoutes />
      </div>
  );
}

export default App;
