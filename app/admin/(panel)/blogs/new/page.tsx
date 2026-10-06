import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/BlogForm";
import { createBlog } from "../actions";

export default async function NewBlogPage() {
  const categories = await prisma.blogCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New blog</h1>
      <BlogForm action={createBlog} categories={categories} />
    </>
  );
}
