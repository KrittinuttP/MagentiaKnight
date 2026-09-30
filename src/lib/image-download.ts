function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Fetches an image and saves it as JPEG (re-encodes anything that isn't JPEG). */
export async function downloadImageAsJpeg(
  src: string,
  filename: string,
  quality = 0.92
) {
  const res = await fetch(src, { mode: "cors" });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const source = await res.blob();

  if (source.type === "image/jpeg") {
    saveBlob(source, filename);
    return;
  }

  const bitmap = await createImageBitmap(source);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    // JPEG has no alpha channel
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);

    const jpeg = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!jpeg) throw new Error("JPEG encode failed");
    saveBlob(jpeg, filename);
  } finally {
    bitmap.close();
  }
}
