import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseServiceClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type ContentBlockInput = {
  blockKey: string;
  blockType?: string;
  content: Record<string, unknown>;
  sortOrder?: number;
  isPublished?: boolean;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) {
    return errorResponse;
  }

  const { slug } = await context.params;
  const supabase = getSupabaseServiceClient();

  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('id,slug,title,status,seo_title,seo_description,updated_at')
    .eq('slug', slug)
    .maybeSingle();

  if (pageError) {
    return NextResponse.json({ error: pageError.message }, { status: 500 });
  }

  if (!page) {
    return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
  }

  const { data: blocks, error: blocksError } = await supabase
    .from('content_blocks')
    .select('id,block_key,block_type,content,sort_order,is_published,updated_at')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true });

  if (blocksError) {
    return NextResponse.json({ error: blocksError.message }, { status: 500 });
  }

  return NextResponse.json({ page, blocks: blocks ?? [] });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { admin, errorResponse } = await requireAdmin(request);
  if (errorResponse) {
    return errorResponse;
  }

  const { slug } = await context.params;
  let payload: {
    title?: string;
    status?: 'draft' | 'published';
    seoTitle?: string;
    seoDescription?: string;
    blocks?: ContentBlockInput[];
  };

  try {
    payload = (await request.json()) as {
      title?: string;
      status?: 'draft' | 'published';
      seoTitle?: string;
      seoDescription?: string;
      blocks?: ContentBlockInput[];
    };
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .upsert(
      {
        slug,
        title: payload.title ?? slug,
        status: payload.status ?? 'published',
        seo_title: payload.seoTitle ?? null,
        seo_description: payload.seoDescription ?? null,
      },
      { onConflict: 'slug' }
    )
    .select('id,slug,title,status,seo_title,seo_description,updated_at')
    .single();

  if (pageError || !page) {
    return NextResponse.json({ error: pageError?.message ?? 'Failed to upsert page.' }, { status: 500 });
  }

  if (payload.blocks?.length) {
    const blockRows = payload.blocks
      .filter((block) => block.blockKey && typeof block.content === 'object')
      .map((block, index) => ({
        page_id: page.id,
        block_key: block.blockKey,
        block_type: block.blockType ?? 'json',
        content: block.content,
        sort_order: Number.isFinite(block.sortOrder) ? Number(block.sortOrder) : index,
        is_published: block.isPublished ?? true,
        updated_by: admin?.authUserId ?? null,
      }));

    if (blockRows.length > 0) {
      const { error: blocksUpsertError } = await supabase
        .from('content_blocks')
        .upsert(blockRows, { onConflict: 'page_id,block_key' });

      if (blocksUpsertError) {
        return NextResponse.json({ error: blocksUpsertError.message }, { status: 500 });
      }
    }
  }

  const { data: blocks } = await supabase
    .from('content_blocks')
    .select('id,block_key,block_type,content,sort_order,is_published,updated_at')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true });

  return NextResponse.json({ page, blocks: blocks ?? [] });
}
