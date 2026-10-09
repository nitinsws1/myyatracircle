import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemberForm from "@/components/admin/MemberForm";
import { updateMember } from "../../actions";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const member = await prisma.teamMember.findUnique({ where: { id: numId } });
  if (!member) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit: {member.name}</h1>
      <MemberForm action={updateMember.bind(null, member.id)} initial={member} />
    </>
  );
}
