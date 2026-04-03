import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function uploadToStorage(
  bucket: string,
  path: string,
  file: Buffer | Blob | File,
  contentType?: string
) {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, { 
      contentType,
      upsert: false
    })
  
  if (error) {
    console.error(`Error uploading to ${bucket}/${path}:`, error)
    throw error
  }
  
  return data
}

export async function downloadFromStorage(bucket: string, path: string): Promise<Buffer> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(path)
  
  if (error) {
    console.error(`Error downloading from ${bucket}/${path}:`, error)
    throw error
  }
  
  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabaseAdmin = getSupabaseAdmin()
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function getSignedUrl(
  bucket: string, 
  path: string, 
  expiresIn: number = 3600
) {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  
  if (error) {
    console.error(`Error creating signed URL for ${bucket}/${path}:`, error)
    throw error
  }
  
  return data.signedUrl
}

export async function deleteFromStorage(bucket: string, path: string) {
  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path])
  
  if (error) {
    console.error(`Error deleting from ${bucket}/${path}:`, error)
    throw error
  }
}

export async function listStorageFiles(bucket: string, path: string = '') {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(path, { limit: 1000 })
  
  if (error) {
    console.error(`Error listing files in ${bucket}/${path}:`, error)
    throw error
  }
  
  return data
}
