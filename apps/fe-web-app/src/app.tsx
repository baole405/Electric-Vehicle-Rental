import "@/app.css";
import { AppRoutes } from "./routes/route.index";

const TITLE = "FCinema";

function App() {
  return (
      <div>
        <title>{TITLE}</title>
          {/* <Toaster position="top-right" /> */}
          <AppRoutes />
      </div>
  );
}

export default App;
