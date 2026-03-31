import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleRoute } from "../utils/formatters";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(form);
      toast.success("Welcome back to Smart Clinic Flow.");
      navigate(roleRoute(user.role));
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-mesh px-4 py-10">
      <div className="grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[36px] border border-white/10 bg-white/5 p-10 shadow-glow lg:block">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Clinic Workflow System</p>
          <h1 className="mt-6 max-w-xl text-5xl font-bold leading-tight text-white">
            Live appointment control with smart queues and calm operations.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Patients book instantly, doctors move the line forward in real time, and admins monitor clinic performance from one modern dashboard.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["Real-time queue", "Emergency priority", "Chart-driven admin panel"].map((feature) => (
              <div key={feature} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-200">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-slate-950/80 p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.35em] text-orange-300">Secure Login</p>
          <h2 className="mt-4 text-3xl font-bold text-white">Access your role dashboard</h2>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/70"
                placeholder="admin@clinic.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/70"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-orange-400 px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            New patient?{" "}
            <Link className="text-cyan-300 hover:text-cyan-200" to="/register">
              Create an account
            </Link>
          </p>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Default seeded admin credentials come from backend env values, for example `admin@clinic.com / Admin@123`.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
