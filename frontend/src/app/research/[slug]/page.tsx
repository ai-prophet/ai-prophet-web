import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";
import { notFound } from "next/navigation";
import ResearchPost from "./ResearchPost";

const CONTENT_DIR = path.join(process.cwd(), "content", "research");

function getPost(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data, content };
}

export function generateStaticParams() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, "") }));
}

export default async function ResearchPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Convert custom directives (:::quote, :::callout, :::remark, :::llm-quote) into blockquotes
  let cleaned = post.content.replace(
    /:::(quote|remark|callout(?:\{[^}]*\})?|llm-quote(?:\{[^}]*\})?)\n([\s\S]*?)^:::\s*$/gm,
    (_match, type: string, body: string) => {
      const prefix = type === "remark" ? "> **Note:** " : "> ";
      return body
        .split("\n")
        .map((line) => (line.trim() ? prefix + line : ">"))
        .join("\n");
    }
  );

  const result = await remark().use(gfm).use(html, { sanitize: false }).process(cleaned);
  const contentHtml = result.toString();

  const heroImg = post.frontmatter.hero_img
    ? `/research/${slug}/${post.frontmatter.hero_img}`
    : null;

  return (
    <ResearchPost
      title={post.frontmatter.title as string}
      date={post.frontmatter.date as string}
      author={post.frontmatter.author as string}
      type={(post.frontmatter.type as string) || "Post"}
      heroImage={heroImg}
      contentHtml={contentHtml}
    />
  );
}
