import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";
import { todayKey } from "../utils/formatters";
import LoadingSpinner from "../components/LoadingSpinner";
import DoctorCard from "../components/DoctorCard";
import QueuePanel from "../components/QueuePanel";
import AppointmentTable from "../components/AppointmentTable";
import useQueueSocket from "../hooks/useQueueSocket";
import { useAuth } from "../context/AuthContext";

function PatientDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const lastStatusRef = useRef(null);

  const activeAppointment = useMemo(
    () =>
      appointments.find(
        (appointment) =>
          appointment.doctor?._id === selectedDoctor?._id &&
          appointment.appointmentDate === selectedDate &&
          appointment.status !== "completed" &&
          appointment.status !== "cancelled"
      ),
    [appointments, selectedDoctor, selectedDate]
  );

  const loadDoctors = async () => {
    const { data } = await api.get("/patient/doctors");
    setDoctors(data);
    setSelectedDoctor((current) => current || data[0] || null);
  };

  const loadAppointments = async () => {
    const { data } = await api.get("/patient/appointments");
    setAppointments(data);
  };

  const loadSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      return;
    }
    const { data } = await api.get(`/patient/slots/${doctorId}/${date}`);
    setSlots(data);
  };

  const loadQueue = async (doctorId, date) => {
    if (!doctorId || !date) {
      return;
    }

    try {
      const { data } = await api.get(`/patient/queue/${doctorId}/${date}`);
      setQueueStatus(data);
    } catch (error) {
      setQueueStatus(null);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([loadDoctors(), loadAppointments()]);
      } catch (error) {
        toast.error("Failed to load patient dashboard.");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadSlots(selectedDoctor._id, selectedDate);
      loadQueue(selectedDoctor._id, selectedDate);
    }
  }, [selectedDoctor, selectedDate]);

  useQueueSocket({
    doctorId: selectedDoctor?._id,
    date: selectedDate,
    onQueueUpdate: (payload) => {
      const mine =
        payload.queue?.find((appointment) => appointment.patient?._id === user?._id) || null;
      const patientsAhead = mine ? Math.max(mine.queueNumber - 1, 0) : null;
      const estimatedTurnInMinutes = mine ? mine.estimatedWaitMinutes : null;

      setQueueStatus({
        ...payload,
        myAppointment: mine,
        patientsAhead,
        estimatedTurnInMinutes
      });

      if (mine?.status === "called" && lastStatusRef.current !== "called") {
        toast.success("You are ready for consultation. Please meet the doctor now.");
      }

      if (estimatedTurnInMinutes != null && estimatedTurnInMinutes <= 15) {
        toast.success(`Your turn is expected in ${estimatedTurnInMinutes} minutes.`);
      }

      lastStatusRef.current = mine?.status || null;
    }
  });

  const handleBookAppointment = async (event) => {
    event.preventDefault();

    if (!selectedDoctor) {
      toast.error("Please choose a doctor.");
      return;
    }

    if (!isEmergency && !selectedSlot) {
      toast.error("Please choose a doctor and free time slot.");
      return;
    }

    setBooking(true);
    try {
      await api.post("/patient/appointments", {
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        slotStart: isEmergency ? null : selectedSlot.slotStart,
        slotEnd: isEmergency ? null : selectedSlot.slotEnd,
        symptoms,
        isEmergency
      });

      toast.success("Appointment booked successfully.");
      setSymptoms("");
      setIsEmergency(false);
      setSelectedSlot(null);
      await Promise.all([
        loadAppointments(),
        loadSlots(selectedDoctor._id, selectedDate),
        loadQueue(selectedDoctor._id, selectedDate)
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Patient Dashboard" subtitle="Preparing your appointment center">
        <LoadingSpinner label="Loading doctors, slots, and your appointment history..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Patient Dashboard" subtitle="Book appointments and track queue movement live">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">Choose a doctor</h2>
              <input
                type="date"
                value={selectedDate}
                min={todayKey()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor._id}
                  doctor={doctor}
                  selected={selectedDoctor?._id === doctor._id}
                  onSelect={setSelectedDoctor}
                />
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Smart slot booking</h2>
                <p className="mt-1 text-sm text-slate-400">Fixed 15-minute slots with double-booking prevention.</p>
              </div>
              <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-orange-200">
                Responsive booking
              </span>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleBookAppointment}>
              <div className="grid gap-3 md:grid-cols-3">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.slotStart}
                    disabled={slot.isBooked || isEmergency}
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-2xl border px-4 py-4 text-sm transition ${
                      slot.isBooked || isEmergency
                        ? "cursor-not-allowed border-white/5 bg-white/5 text-slate-500"
                        : selectedSlot?.slotStart === slot.slotStart
                        ? "border-cyan-400/70 bg-cyan-400/15 text-white"
                        : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"
                    }`}
                  >
                    <div>{slot.slotStart}</div>
                    <div className="mt-1 text-xs">{slot.slotEnd}</div>
                  </button>
                ))}
              </div>

              <textarea
                rows="4"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe symptoms or visit purpose"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/70"
              />

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsEmergency(checked);
                    if (checked) {
                      setSelectedSlot(null);
                    }
                  }}
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-orange-400"
                />
                Mark this visit as emergency priority. Emergency bookings skip slot selection and move to the front.
              </label>

              <button
                type="submit"
                disabled={booking}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-orange-400 px-6 py-3 font-semibold text-slate-950 disabled:opacity-70"
              >
                {booking ? "Booking..." : "Book Appointment"}
              </button>
            </form>
          </section>

          {(queueStatus?.myAppointment || activeAppointment) && <QueuePanel queueStatus={queueStatus} />}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="section-title">Queue summary</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Selected doctor</p>
                <p className="mt-1 text-xl font-semibold text-white">{selectedDoctor?.name || "None selected"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Today in line</p>
                <p className="mt-1 text-xl font-semibold text-white">{queueStatus?.totalWaiting ?? 0} waiting</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Emergency cases in queue</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {queueStatus?.queue?.filter((item) => item.isEmergency).length ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 section-title">My appointments</h2>
            <AppointmentTable appointments={appointments} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PatientDashboard;
