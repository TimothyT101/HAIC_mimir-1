import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f6f8f7] text-ink transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
