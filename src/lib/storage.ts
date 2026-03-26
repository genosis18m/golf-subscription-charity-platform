import { createAdminClient } from '@/lib/supabase/admin';

const ensuredBuckets = new Set<string>();

export async function ensureStorageBucket(
  bucket: string,
  options: {
    public: boolean;
    allowedMimeTypes: string[];
    fileSizeLimit: string;
  }
) {
  if (ensuredBuckets.has(bucket)) {
    return;
  }

  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(listError.message);
  }

  const exists = buckets?.some((entry) => entry.name === bucket);

  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucket, options);

    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(createError.message);
    }
  }

  ensuredBuckets.add(bucket);
}
