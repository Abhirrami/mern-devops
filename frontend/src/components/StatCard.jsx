function StatCard({ title, value, helper, accent = "from-cyan-500/25 to-emerald-500/10" }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-gradient-to-br ${accent} p-[1px] shadow-glow`}>
      <div className="h-full rounded-[22px] bg-slate-950/90 p-5">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-300">{helper}</p>
      </div>
    </div>
  );
}

export default StatCard;
