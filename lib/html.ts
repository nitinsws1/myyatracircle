import "server-only";
import sanitizeHtml from "sanitize-html";

const ALIGN = { "text-align": [/^(left|right|center|justify)$/] };

// Safe HTML for Tiptap output (headings, lists, links, images, alignment ...)
export function cleanHtml(html?: string | null): string {
  if (!html) return "";

  // plain text saved without any tags → wrap it in paragraphs
  const source = /<[a-z][\s\S]*>/i.test(html)
    ? html
    : html
        .split(/\n\s*\n/)
        .map((p) => `<p>${p.trim()}</p>`)
        .join("");

  return sanitizeHtml(source, {
    allowedTags: [
      "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "mark", "code", "pre",
      "blockquote", "ul", "ol", "li", "a", "img", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      p: ["style"],
      h1: ["style"], h2: ["style"], h3: ["style"], h4: ["style"], h5: ["style"], h6: ["style"],
      ol: ["start"],
    },
    allowedStyles: { "*": ALIGN },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : attribs,
        };
      },
    },
  });
}

// Plain text only (for the hero eyebrow / title)
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}