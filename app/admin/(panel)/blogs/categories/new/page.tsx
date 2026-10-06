import CategoryForm from "@/components/admin/CategoryForm";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New category</h1>
      <CategoryForm action={createCategory} />
    </>
  );
}
