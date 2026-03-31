import { LogOut, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-hero-mesh">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass-card flex flex-col gap-5 rounded-[32px] p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-orange-400 text-slate-950">
              <Stethoscope />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/80">Smart Clinic Flow</p>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <p className="text-sm text-slate-300">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm text-slate-400">Signed in as</p>
              <p className="font-medium text-white">
                {user?.name} <span className="text-cyan-200">({user?.role})</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <main className="mt-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
