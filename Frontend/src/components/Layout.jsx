import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        padding: "40px",
        backgroundColor: "#f0f6ff",
        overflowY: "auto",
      }}>
        <Outlet />
      </main>
    </div>
  );
}
