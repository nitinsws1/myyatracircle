import DestinationForm from "@/components/admin/DestinationForm";
import { createDestination } from "../actions";

export default function NewDestinationPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New destination</h1>
      <DestinationForm action={createDestination} />
    </>
  );
}
