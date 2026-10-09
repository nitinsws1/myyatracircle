import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/BlogForm";
import { createBlog } from "../actions";

export default async function NewBlogPage() {
  const [categories, authorRows, tagRows] = await Promise.all([
    prisma.blogCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.blog.findMany({ where: { authorName: { not: null } }, distinct: ["authorName"], select: { authorName: true } }),
    prisma.tag.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New post</h1>
      <BlogForm action={createBlog} categories={categories}
        authors={authorRows.map((a) => a.authorName!)} tagOptions={tagRows.map((t) => t.name)} initialTags={[]} />
    </>
  );
}
