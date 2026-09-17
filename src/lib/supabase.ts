import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
);

// If not configured, create a dummy client or null to prevent crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload an image file to the public `products_images` bucket in Supabase
 */
export async function uploadProductImage(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { url: null, error: 'Supabase is not configured' };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products_images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('products_images')
      .getPublicUrl(fileName);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Failed to upload image' };
  }
}
