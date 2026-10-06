"use client";

import { useState, useTransition } from "react";
import { STATUSES, STATUS_LABEL, STATUS_STYLE, type Status } from "@/lib/inquiry-config";

// A coloured dropdown that saves as soon as the admin picks a new status
export default function StatusSelect({ value, action }: {
  value: Status;
  action: (status: Status) => Promise<void>;
}) {
  const [current, setCurrent] = useState<Status>(value);
  const [pending, start] = useTransition();

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as Status;
        const before = current;
        setCurrent(next);
        start(async () => {
          try { await action(next); } catch { setCurrent(before); }
        });
      }}
      className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none disabled:opacity-60 ${STATUS_STYLE[current]}`}>
      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
    </select>
  );
}
