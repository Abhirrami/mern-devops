function AppointmentTable({ appointments }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Token</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments?.length ? (
              appointments.map((appointment) => (
                <tr key={appointment._id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    {appointment.patient?.name || "You"}
                    <p className="text-xs text-slate-400">{appointment.patient?.email || "Patient record"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {appointment.doctor?.name || "You"}
                    <p className="text-xs text-slate-400">{appointment.doctor?.specialization || "Clinic doctor"}</p>
                  </td>
                  <td className="px-4 py-3">{appointment.appointmentDate}</td>
                  <td className="px-4 py-3">
                    {appointment.serviceSlotStart || appointment.slotStart || "Emergency priority"}
                    {" - "}
                    {appointment.serviceSlotEnd || appointment.slotEnd || "Immediate"}
                  </td>
                  <td className="px-4 py-3">{appointment.tokenNumber}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide">
                      {appointment.status}
                      {appointment.isEmergency ? " / Emergency" : ""}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-slate-400" colSpan="6">
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AppointmentTable;
