import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import AppointmentTable from "../components/AppointmentTable";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const defaultSlots = ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00"];

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    consultationFee: "",
    availability: defaultSlots.join(",")
  });

  const loadAdminData = async () => {
    const [{ data: dashboardData }, { data: appointmentData }] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/appointments")
    ]);
    setDashboard(dashboardData);
    setAppointments(appointmentData);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadAdminData();
      } catch (error) {
        toast.error("Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const performanceData = useMemo(
    () => ({
      labels: dashboard?.doctorPerformance?.map((item) => item.name) || [],
      datasets: [
        {
          label: "Completed Appointments",
          data: dashboard?.doctorPerformance?.map((item) => item.completedAppointments) || [],
          backgroundColor: "rgba(34, 211, 238, 0.7)"
        },
        {
          label: "Emergency Cases",
          data: dashboard?.doctorPerformance?.map((item) => item.emergenciesHandled) || [],
          backgroundColor: "rgba(249, 115, 22, 0.7)"
        }
      ]
    }),
    [dashboard]
  );

  const trafficData = useMemo(
    () => ({
      labels: dashboard?.totalPatientsPerDay?.map((item) => item._id) || [],
      datasets: [
        {
          label: "Patients per day",
          data: dashboard?.totalPatientsPerDay?.map((item) => item.count) || [],
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34, 211, 238, 0.25)",
          tension: 0.3
        }
      ]
    }),
    [dashboard]
  );

  const peakHoursData = useMemo(
    () => ({
      labels: dashboard?.peakHours?.map((item) => item._id) || [],
      datasets: [
        {
          label: "Peak hours",
          data: dashboard?.peakHours?.map((item) => item.appointments) || [],
          backgroundColor: [
            "rgba(14, 165, 233, 0.85)",
            "rgba(16, 185, 129, 0.85)",
            "rgba(249, 115, 22, 0.85)",
            "rgba(244, 63, 94, 0.85)"
          ]
        }
      ]
    }),
    [dashboard]
  );

  const handleAddDoctor = async (event) => {
    event.preventDefault();
    try {
      await api.post("/admin/doctors", {
        ...doctorForm,
        availability: doctorForm.availability.split(",").map((slot) => slot.trim())
      });
      toast.success("Doctor added successfully.");
      setDoctorForm({
        name: "",
        email: "",
        password: "",
        specialization: "",
        consultationFee: "",
        availability: defaultSlots.join(",")
      });
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add doctor.");
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    try {
      await api.delete(`/admin/doctors/${doctorId}`);
      toast.success("Doctor removed.");
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove doctor.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard" subtitle="Loading performance and staffing data">
        <LoadingSpinner label="Preparing clinic analytics..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Manage doctors, monitor traffic, and optimize clinic flow">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Doctors" value={dashboard?.totals?.doctors ?? 0} helper="Active doctors currently available" />
        <StatCard
          title="Patients"
          value={dashboard?.totals?.patients ?? 0}
          helper="Registered patients in the system"
          accent="from-orange-500/25 to-cyan-500/10"
        />
        <StatCard
          title="Avg Wait"
          value={`${dashboard?.averageWaitingTime ?? 0} min`}
          helper="Average patient wait time before consultation"
          accent="from-emerald-500/25 to-cyan-500/10"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={handleAddDoctor} className="glass-card rounded-3xl p-6">
          <h2 className="section-title">Add doctor</h2>
          <div className="mt-5 space-y-4">
            {[
              ["name", "Doctor name"],
              ["email", "Doctor email"],
              ["password", "Temporary password"],
              ["specialization", "Specialization"],
              ["consultationFee", "Consultation fee"],
              ["availability", "Comma-separated availability"]
            ].map(([key, label]) => (
              <input
                key={key}
                type={key === "password" ? "password" : "text"}
                placeholder={label}
                value={doctorForm[key]}
                onChange={(e) => setDoctorForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/70"
                required={key !== "consultationFee"}
              />
            ))}
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-orange-400 px-4 py-3 font-semibold text-slate-950"
            >
              Create Doctor
            </button>
          </div>
        </form>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="section-title">Patients per day</h2>
            <div className="mt-4">
              <Line data={trafficData} />
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6">
            <h2 className="section-title">Peak hours</h2>
            <div className="mt-4 flex justify-center">
              <div className="max-w-[280px]">
                <Doughnut data={peakHoursData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Doctor performance</h2>
          </div>
          <div className="mt-4">
            <Bar data={performanceData} />
          </div>
          <div className="mt-6 space-y-3">
            {dashboard?.doctors?.map((doctor) => (
              <div key={doctor._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-semibold text-white">{doctor.name}</p>
                  <p className="text-sm text-slate-400">{doctor.specialization}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDoctor(doctor._id)}
                  className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 section-title">All appointments</h2>
          <AppointmentTable appointments={appointments} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
