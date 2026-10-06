export const GALLERY_MAX = 5;

export type GalleryRow = { url: string; type: "IMAGE" | "VIDEO"; sortOrder: number };

// The form sends the gallery as JSON text: [{ url, type }]. Validate it on the server.
export function parseGallery(raw: string): { gallery: GalleryRow[]; error?: string } {
  try {
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) throw new Error();
    if (arr.length > GALLERY_MAX) {
      return { gallery: [], error: `You can add at most ${GALLERY_MAX} gallery items` };
    }
    const gallery = arr.map((g: { url?: unknown; type?: unknown }, i: number): GalleryRow => {
      if (typeof g?.url !== "string" || !/^(https?:\/\/|\/)/.test(g.url)) throw new Error();
      return { url: g.url, type: g.type === "VIDEO" ? "VIDEO" : "IMAGE", sortOrder: i };
    });
    return { gallery };
  } catch {
    return { gallery: [], error: "Gallery data is invalid. Please re-add the items." };
  }
}
