function DoctorCard({ doctor, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(doctor)}
      className={`rounded-3xl border p-5 text-left transition duration-300 ${
        selected
          ? "border-cyan-400/60 bg-cyan-400/10 shadow-glow"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <p className="text-lg font-semibold text-white">{doctor.name}</p>
      <p className="mt-1 text-sm text-cyan-200">{doctor.specialization}</p>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <span>Fee: Rs. {doctor.consultationFee}</span>
        <span>{doctor.availability?.length || 0} slots</span>
      </div>
    </button>
  );
}

export default DoctorCard;
