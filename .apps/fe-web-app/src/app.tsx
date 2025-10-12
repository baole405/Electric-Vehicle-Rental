import "@/app.css";
import { AppRoutes } from "@/routes/route.index";

const TITLE = "Ev-Rental";

function App() {
  return (
    <div
      data-theme="evRental"
      className="min-h-screen bg-base-200 text-base-content"
    >
      <title>{TITLE}</title>
      {/* <Toaster position="top-right" /> */}
      <AppRoutes />
    </div>
  );
}

export default App;
