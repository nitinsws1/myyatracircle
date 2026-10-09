import PageForm from "@/components/admin/PageForm";
import { createPage } from "../actions";

export default function NewPagePage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New page</h1>
      <PageForm action={createPage} />
    </>
  );
}
