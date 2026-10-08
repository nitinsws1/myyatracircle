import WhyUsForm from "@/components/admin/WhyUsForm";
import { createWhy } from "../../actions";

export default function NewWhyPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Add reason</h1>
      <WhyUsForm action={createWhy} />
    </>
  );
}
