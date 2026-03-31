function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-100 border-t-accent" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
