import sanitizeHtml from "sanitize-html";

// Runs on the SERVER before saving. Keeps only the tags our editor can produce,
// so nothing dangerous (scripts, inline events) can ever reach the database.
export function cleanHtml(html: string) {
  const out = sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
    },
  });
  return out === "<p></p>" ? "" : out; // an "empty" editor counts as empty
}
