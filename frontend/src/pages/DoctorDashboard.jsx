import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import AppointmentTable from "../components/AppointmentTable";
import { todayKey } from "../utils/formatters";
import useQueueSocket from "../hooks/useQueueSocket";
import { useAuth } from "../context/AuthContext";

function DoctorDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const loadDashboard = async () => {
    const { data } = await api.get(`/doctor/appointments?date=${selectedDate}`);
    setAppointments(data.appointments);
    setQueue(data.queue);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadDashboard();
      } catch (error) {
        toast.error("Failed to load doctor dashboard.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [selectedDate]);

  useQueueSocket({
    doctorId: user?._id,
    date: selectedDate,
    onQueueUpdate: (payload) => setQueue(payload)
  });

  const runQueueAction = async (endpoint) => {
    setActionLoading(endpoint);
    try {
      const { data } = await api.post(endpoint, { appointmentDate: selectedDate });
      setQueue(data.queue);
      await loadDashboard();
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to move queue forward.");
    } finally {
      setActionLoading("");
    }
  };

  const calledPatient = queue?.queue?.find((item) => item.status === "called");
  const currentPatient = queue?.queue?.find((item) => item.status === "in-progress");

  if (loading) {
    return (
      <DashboardLayout title="Doctor Dashboard" subtitle="Managing today's queue">
        <LoadingSpinner label="Loading appointment queue..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Doctor Dashboard" subtitle="See appointments, live queue order, and advance patients">
      <div className="grid gap-6 lg:grid-cols-3">
        <StatCard
          title="Now Serving Token"
          value={queue?.nowServingToken ?? "--"}
          helper={queue?.nowServingPatientName ? `${queue.nowServingPatientName} is in consultation` : "No active consultation right now"}
        />
        <StatCard
          title="Patients In Queue"
          value={queue?.patientsInQueue ?? 0}
          helper="Total patients currently waiting or being served"
          accent="from-orange-500/25 to-cyan-500/10"
        />
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Queue actions</p>
              <p className="mt-2 text-xl font-semibold text-white">Control the consultation flow</p>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            />
          </div>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => runQueueAction("/doctor/queue/start")}
              disabled={actionLoading !== "" || !calledPatient}
              className="w-full rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {actionLoading === "/doctor/queue/start" ? "Starting..." : "Serve Patient"}
            </button>
            <button
              type="button"
              onClick={() => runQueueAction("/doctor/queue/complete")}
              disabled={actionLoading !== "" || !currentPatient}
              className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {actionLoading === "/doctor/queue/complete" ? "Completing..." : "Mark Complete"}
            </button>
            <button
              type="button"
              onClick={() => runQueueAction("/doctor/queue/next")}
              disabled={actionLoading !== "" || Boolean(calledPatient) || Boolean(currentPatient)}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-orange-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {actionLoading === "/doctor/queue/next" ? "Calling..." : "Next Patient"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="section-title">Queue list</h2>
          <div className="mt-5 space-y-3">
            {queue?.queue?.length ? (
              queue.queue.map((item) => (
                <div
                  key={item._id}
                  className={`rounded-2xl border p-4 ${
                    item.status === "in-progress"
                      ? "border-emerald-400/40 bg-emerald-400/10"
                      : item.status === "called"
                      ? "border-orange-400/40 bg-orange-400/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.patient?.name}</p>
                      <p className="text-sm text-slate-400">
                        Token {item.tokenNumber} | Queue {item.queueNumber}
                      </p>
                      <p className="text-sm text-slate-400">
                        Service slot {item.serviceSlotStart || item.slotStart || "Emergency"} - {item.serviceSlotEnd || item.slotEnd || "Immediate"}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs uppercase tracking-wide text-slate-200">
                      {item.status}
                    </span>
                  </div>
                  {item.isEmergency && (
                    <p className="mt-3 inline-flex rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs text-orange-200">
                      Emergency priority
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-400">No patients in queue.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 section-title">Today's appointments</h2>
          <AppointmentTable appointments={appointments} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DoctorDashboard;
