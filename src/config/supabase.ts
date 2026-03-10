import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * Files are stored under: product-images/{userId}/{timestamp}-{filename}
 */
export async function uploadProductImage(
  file: File,
  userId: string,
): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Uploads multiple files and returns all public URLs.
 */
export async function uploadProductImages(
  files: File[],
  userId: string,
): Promise<string[]> {
  const uploads = files.map((file) => uploadProductImage(file, userId));
  return Promise.all(uploads);
}
