import "@/app.css";
import { AppRoutes } from "@/routes/route.index";

const TITLE = "EV Rental";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <title>{TITLE}</title>
      <AppRoutes />
    </div>
  );
}

export default App;
