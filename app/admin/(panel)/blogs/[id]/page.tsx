import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/BlogForm";
import { updateBlog } from "../actions";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const [blog, categories] = await Promise.all([
    prisma.blog.findUnique({ where: { id: numId } }),
    prisma.blogCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!blog) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit blog: {blog.title}</h1>
      <BlogForm action={updateBlog.bind(null, blog.id)} categories={categories} initial={blog} />
    </>
  );
}
