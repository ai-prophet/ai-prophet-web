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

  // Convert custom directives into blockquotes or special HTML
  // First pass: extract :::llm-quote{model="..."} blocks and convert to raw HTML
  let cleaned = post.content.replace(
    /:::llm-quote\{model="([^"]+)"\}\n([\s\S]*?)^:::\s*$/gm,
    (_match, model: string, body: string) => {
      // Convert **bold** markdown to <strong> since remark won't process inside raw HTML
      const htmlBody = body.trim().replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      return `\n\n<blockquote class="llm-quote" data-model="${model}"><p>${htmlBody}</p></blockquote>\n\n`;
    }
  );

  // Second pass: convert :::remark into styled div, others into markdown blockquotes
  cleaned = cleaned.replace(
    /:::(quote|remark|callout(?:\{[^}]*\})?)\n([\s\S]*?)^:::\s*$/gm,
    (_match, type: string, body: string) => {
      if (type === "remark") {
        const htmlBody = body.trim()
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        return `\n\n<div class="prophet-remark"><p>${htmlBody}</p></div>\n\n`;
      }
      if (type.startsWith("callout")) {
        // Extract type attribute e.g. callout{type="info"} → info
        const typeMatch = type.match(/type="([^"]+)"/);
        const calloutType = typeMatch ? typeMatch[1] : "info";
        const htmlBody = body.trim()
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        return `\n\n<div class="callout callout-${calloutType}"><p>${htmlBody}</p></div>\n\n`;
      }
      const prefix = "> ";
      return body
        .split("\n")
        .map((line) => (line.trim() ? prefix + line : ">"))
        .join("\n");
    }
  );

  // Convert standalone italic _Note that ..._ paragraphs into styled note boxes
  cleaned = cleaned.replace(
    /^(\s*)_Note that\b([\s\S]*?)_\s*$/gm,
    (_match, indent: string, rest: string) => {
      const htmlBody = rest.trim()
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      return `${indent}\n\n<div class="prose-note">Note that ${htmlBody}</div>\n\n`;
    }
  );

  // Protect escaped dollar signs from KaTeX by converting \$ to a placeholder
  cleaned = cleaned.replace(/\\\$/g, "ESCAPED_DOLLAR_SIGN");

  // Extract inline citations: [Citation text](#reference) → superscript numbered links
  const references: string[] = [];
  cleaned = cleaned.replace(
    /\[([^\]]+?)\]\(#reference\)/g,
    (_match, citationText: string) => {
      // Check if this citation already exists to avoid duplicates
      let idx = references.indexOf(citationText);
      if (idx === -1) {
        references.push(citationText);
        idx = references.length - 1;
      }
      const num = idx + 1;
      return `<sup class="ref-link"><a href="#ref-${num}" id="cite-${num}">[${num}]</a></sup>`;
    }
  );

  // Remove any existing "# Reference" placeholder section
  cleaned = cleaned.replace(/^#\s*References?\s*\n[\s\S]*?(?=^#|\Z)/gm, "");

  const result = await remark().use(gfm).use(html, { sanitize: false }).process(cleaned);
  let contentHtml = result.toString().replace(/ESCAPED_DOLLAR_SIGN/g, '<span class="dollar-sign">$</span>');

  // Extract TOC from markdown source (before HTML conversion) for clean heading text
  const tocFromMd: { id: string; text: string; level: number }[] = [];
  const headingRegex = /^(#{1,3})\s+\**(.+?)\**\s*$/gm;
  let hMatch;
  while ((hMatch = headingRegex.exec(post.content)) !== null) {
    const level = hMatch[1].length;
    // Strip markdown formatting from heading text
    const text = hMatch[2]
      .replace(/\*\*/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+$/, "");
    tocFromMd.push({ id, text, level });
  }
  const toc = tocFromMd;

  // Add IDs to all headings in HTML (h1-h3)
  contentHtml = contentHtml.replace(
    /<h([1-3])(\s[^>]*)?>[\s\S]*?<\/h[1-3]>/g,
    (match, level: string) => {
      const text = match
        .replace(/<[^>]+>/g, "")
        .trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+$/, "");
      // Replace just the opening tag to add the id
      return match.replace(
        new RegExp(`<h${level}([^>]*)?>`),
        `<h${level} id="${id}">`
      );
    }
  );

  // Append reference list at the bottom if any references were found
  if (references.length > 0) {
    const refItems = references
      .map(
        (text, i) =>
          `<li id="ref-${i + 1}" class="ref-item"><a href="#cite-${i + 1}" class="ref-back">↩</a> ${text}</li>`
      )
      .join("\n");
    contentHtml += `\n<section class="references-section"><h2>References</h2><ol class="references-list">${refItems}</ol></section>`;
  }

  const heroImg = post.frontmatter.hero_img
    ? `/research/${slug}/${post.frontmatter.hero_img}`
    : null;

  return (
    <ResearchPost
      title={post.frontmatter.title as string}
      date={post.frontmatter.date as string}
      author={post.frontmatter.author as string}
      heroImage={heroImg}
      contentHtml={contentHtml}
      toc={toc}
      slug={slug}
    />
  );
}
