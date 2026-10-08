import { ArrowDown, ArrowUp } from "lucide-react";

// Up / down arrows for lists where the order matters. Two tiny forms, no client JavaScript.
export default function MoveButtons({ up, down, disableUp, disableDown }: {
  up: () => Promise<void>;
  down: () => Promise<void>;
  disableUp?: boolean;
  disableDown?: boolean;
}) {
  const cls = "rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex">
      <form action={up}>
        <button disabled={disableUp} title="Move up" className={cls}><ArrowUp size={16} /></button>
      </form>
      <form action={down}>
        <button disabled={disableDown} title="Move down" className={cls}><ArrowDown size={16} /></button>
      </form>
    </div>
  );
}
