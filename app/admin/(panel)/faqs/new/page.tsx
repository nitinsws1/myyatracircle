import FaqForm from "@/components/admin/FaqForm";
import { createFaq } from "../actions";

export default function NewFaqPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New FAQ</h1>
      <FaqForm action={createFaq} />
    </>
  );
}
