import { getSupabaseServiceClient, hasSupabaseServiceConfig } from './supabase';

export type CmsBlocks = Record<string, unknown>;

function mergeWithFallback<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (Array.isArray(fallback)) {
    return (Array.isArray(value) ? value : fallback) as T;
  }

  if (
    typeof fallback === 'object' &&
    fallback !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return {
      ...(fallback as Record<string, unknown>),
      ...(value as Record<string, unknown>),
    } as T;
  }

  return value as T;
}

export async function getPageBlocks(slug: string): Promise<CmsBlocks> {
  if (!hasSupabaseServiceConfig()) {
    return {};
  }

  const supabase = getSupabaseServiceClient();
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (pageError || !page) {
    return {};
  }

  const { data: blocks, error: blocksError } = await supabase
    .from('content_blocks')
    .select('block_key,content,is_published')
    .eq('page_id', page.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (blocksError || !blocks) {
    return {};
  }

  return blocks.reduce<CmsBlocks>((accumulator, block) => {
    accumulator[block.block_key] = block.content;
    return accumulator;
  }, {});
}

export function getBlockValue<T>(blocks: CmsBlocks, key: string, fallback: T): T {
  return mergeWithFallback(blocks[key], fallback);
}

export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  if (!hasSupabaseServiceConfig()) {
    return fallback;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('setting_key', key)
    .maybeSingle();

  if (error || !data?.value) {
    return fallback;
  }

  return mergeWithFallback(data.value, fallback);
}
