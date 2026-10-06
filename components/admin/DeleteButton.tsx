"use client";

import { Trash2 } from "lucide-react";

export default function DeleteButton({ action, message }: { action: () => Promise<void>; message: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      <button className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Delete">
        <Trash2 size={16} />
      </button>
    </form>
  );
}
