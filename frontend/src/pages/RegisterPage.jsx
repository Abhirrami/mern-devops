import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(form);
      toast.success("Patient account created successfully.");
      navigate("/patient");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-mesh px-4 py-10">
      <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-slate-950/85 p-8 shadow-glow">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Patient Registration</p>
        <h1 className="mt-4 text-3xl font-bold text-white">Book smarter clinic visits</h1>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/70"
            required
          />
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/70"
            required
          />
          <input
            type="password"
            placeholder="Create password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/70"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-orange-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create Patient Account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already have access?{" "}
          <Link to="/login" className="text-cyan-300 hover:text-cyan-200">
            Return to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
