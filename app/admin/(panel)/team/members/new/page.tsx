import MemberForm from "@/components/admin/MemberForm";
import { createMember } from "../../actions";

export default function NewMemberPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Add team member</h1>
      <MemberForm action={createMember} />
    </>
  );
}
