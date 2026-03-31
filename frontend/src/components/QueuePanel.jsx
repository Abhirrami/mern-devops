function QueuePanel({ queueStatus }) {
  const progress = queueStatus?.myAppointment?.queueNumber
    ? Math.max(100 - (queueStatus.patientsAhead / queueStatus.myAppointment.queueNumber) * 100, 12)
    : 0;

  return (
    <div className="glass-card rounded-3xl p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Live Queue</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Track your turn in real time</h3>
        </div>
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
          Now serving token: {queueStatus?.nowServingToken ?? "Waiting"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Your token</p>
          <p className="mt-2 text-3xl font-bold text-white">{queueStatus?.myAppointment?.tokenNumber ?? "--"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Patients ahead</p>
          <p className="mt-2 text-3xl font-bold text-white">{queueStatus?.patientsAhead ?? "--"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Estimated wait</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {queueStatus?.estimatedTurnInMinutes != null ? `${queueStatus.estimatedTurnInMinutes} min` : "--"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Doctor currently handling</p>
          <p className="mt-2 text-lg font-semibold text-white">{queueStatus?.myAppointment?.doctor?.name || "--"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Your assigned service slot</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {queueStatus?.myAppointment?.serviceSlotStart || queueStatus?.myAppointment?.slotStart || "--"}
            {" - "}
            {queueStatus?.myAppointment?.serviceSlotEnd || queueStatus?.myAppointment?.slotEnd || "--"}
          </p>
        </div>
      </div>

      {queueStatus?.myAppointment?.status === "called" && (
        <div className="mt-4 rounded-2xl border border-orange-400/30 bg-orange-400/10 p-4 text-orange-100">
          Your doctor is ready now. Please move to the consultation room.
        </div>
      )}

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm text-slate-400">
          <span>Queue progress</span>
          <span>{queueStatus?.myAppointment?.isEmergency ? "Emergency priority enabled" : "Standard flow"}</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full animate-pulsebar rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-orange-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default QueuePanel;
