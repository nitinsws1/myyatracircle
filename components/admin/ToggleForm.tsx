// One-click on/off badge used in admin lists. No client JavaScript needed:
// it is a tiny form that calls a server action.
export default function ToggleForm({ action, on, onLabel, offLabel, disabled, title }: {
  action: () => Promise<void>;
  on: boolean;
  onLabel: string;
  offLabel: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <form action={action}>
      <button
        disabled={disabled}
        title={title}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
          on ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}>
        {on ? onLabel : offLabel}
      </button>
    </form>
  );
}
