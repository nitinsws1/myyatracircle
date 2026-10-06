import { registerMedia } from "@/app/admin/(panel)/media/actions";
import { checkFile, kindFromFile, type MediaKind } from "@/lib/media-config";

export type Uploaded = { url: string; kind: MediaKind; name: string };

// Browser -> Cloudinary directly, then the file is also recorded in the media library.
export async function uploadAndRegister(file: File, folder: string, kind: MediaKind = kindFromFile(file)): Promise<Uploaded> {
  const problem = checkFile(file, kind);
  if (problem) throw new Error(`${file.name}: ${problem}`);

  const sigRes = await fetch("/api/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!sigRes.ok) throw new Error("Not allowed. Please log in again.");
  const sig = await sigRes.json();

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("signature", sig.signature);
  fd.append("folder", sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(`${file.name}: ${data.error?.message ?? "upload failed"}`);

  try {
    await registerMedia({
      url: data.secure_url, publicId: data.public_id, resourceType: data.resource_type,
      bytes: data.bytes, width: data.width, height: data.height,
      mimeType: file.type, name: file.name, kind,
    });
  } catch {
    // The upload itself worked. If recording fails, "Import existing" on the library page can add it later.
  }
  return { url: data.secure_url, kind, name: file.name };
}
