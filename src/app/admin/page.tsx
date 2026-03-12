'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type AdminUser = {
  authUserId: string;
  email: string | null;
  role: string;
};

type SiteSetting = {
  setting_key: string;
  setting_type: string;
  value: Record<string, unknown>;
  updated_at: string;
};

type PageSummary = {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
};

type PageContentDetail = {
  page: {
    id: string;
    slug: string;
    title: string;
    status: 'draft' | 'published';
    seo_title: string | null;
    seo_description: string | null;
  };
  blocks: Array<{
    id: string;
    block_key: string;
    block_type: string;
    content: Record<string, unknown>;
    sort_order: number;
    is_published: boolean;
  }>;
};

const MANAGED_SETTINGS = [
  'announcement_banner',
  'contact_details',
  'pickup_locations',
  'pickup_default_capacity',
] as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [settingDrafts, setSettingDrafts] = useState<Record<string, string>>({});
  const [settingsSavingKey, setSettingsSavingKey] = useState<string | null>(null);

  const [pages, setPages] = useState<PageSummary[]>([]);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageSeoTitle, setPageSeoTitle] = useState('');
  const [pageSeoDescription, setPageSeoDescription] = useState('');
  const [blocksDraft, setBlocksDraft] = useState('[]');
  const [contentSaving, setContentSaving] = useState(false);

  const [productOverridesDraft, setProductOverridesDraft] = useState('[]');
  const [isSavingOverrides, setIsSavingOverrides] = useState(false);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);

  const authorizedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!token) {
        throw new Error('Missing admin access token.');
      }

      const response = await fetch(path, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(init?.headers ?? {}),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Request failed.');
      }

      return data;
    },
    [token]
  );

  const loadAdminContext = useCallback(async () => {
    const accessToken = localStorage.getItem('admin_access_token');
    if (!accessToken) {
      router.replace('/admin/login');
      return;
    }

    setToken(accessToken);

    try {
      const response = await fetch('/api/admin/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Unauthorized');
      }
      setAdmin(data.admin as AdminUser);
    } catch (loadError) {
      localStorage.removeItem('admin_access_token');
      router.replace('/admin/login');
      throw loadError;
    }
  }, [router]);

  const loadSettings = useCallback(async () => {
    const data = await authorizedFetch('/api/admin/settings');
    const loadedSettings = (data.settings ?? []) as SiteSetting[];
    setSettings(loadedSettings);

    const drafts: Record<string, string> = {};
    for (const setting of loadedSettings) {
      drafts[setting.setting_key] = JSON.stringify(setting.value ?? {}, null, 2);
    }
    setSettingDrafts(drafts);
  }, [authorizedFetch]);

  const loadPages = useCallback(async () => {
    const data = await authorizedFetch('/api/admin/content');
    const loadedPages = (data.pages ?? []) as PageSummary[];
    setPages(loadedPages);
    if (loadedPages.length > 0 && !selectedPageSlug) {
      setSelectedPageSlug(loadedPages[0].slug);
    }
  }, [authorizedFetch, selectedPageSlug]);

  const loadProductOverrides = useCallback(async () => {
    const data = await authorizedFetch('/api/admin/product-overrides');
    setProductOverridesDraft(JSON.stringify(data.overrides ?? [], null, 2));
  }, [authorizedFetch]);

  const loadPageDetail = useCallback(
    async (slug: string) => {
      if (!slug) {
        return;
      }
      const data = (await authorizedFetch(`/api/admin/content/${slug}`)) as PageContentDetail;
      setPageTitle(data.page.title);
      setPageSeoTitle(data.page.seo_title ?? '');
      setPageSeoDescription(data.page.seo_description ?? '');
      const formattedBlocks = (data.blocks ?? []).map((block) => ({
        blockKey: block.block_key,
        blockType: block.block_type,
        content: block.content,
        sortOrder: block.sort_order,
        isPublished: block.is_published,
      }));
      setBlocksDraft(JSON.stringify(formattedBlocks, null, 2));
    },
    [authorizedFetch]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await loadAdminContext();
      } catch (initError) {
        if (mounted) {
          setError(initError instanceof Error ? initError.message : 'Failed to load admin session.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [loadAdminContext]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadAll = async () => {
      try {
        await Promise.all([loadSettings(), loadPages(), loadProductOverrides()]);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load admin data.');
      }
    };

    loadAll();
  }, [token, loadSettings, loadPages, loadProductOverrides]);

  useEffect(() => {
    if (!token || !selectedPageSlug) {
      return;
    }
    loadPageDetail(selectedPageSlug).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load page content.');
    });
  }, [token, selectedPageSlug, loadPageDetail]);

  const visibleSettings = useMemo(() => {
    const byKey = new Map(settings.map((setting) => [setting.setting_key, setting]));
    return MANAGED_SETTINGS.map((key) => ({
      key,
      setting: byKey.get(key) ?? null,
      draft: settingDrafts[key] ?? '{}',
    }));
  }, [settings, settingDrafts]);

  const handleSaveSetting = async (key: string) => {
    setSettingsSavingKey(key);
    setError(null);
    try {
      const parsed = JSON.parse(settingDrafts[key] ?? '{}') as Record<string, unknown>;
      await authorizedFetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value: parsed }),
      });
      await loadSettings();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `Failed to save setting ${key}.`);
    } finally {
      setSettingsSavingKey(null);
    }
  };

  const handleSaveContent = async () => {
    if (!selectedPageSlug) {
      return;
    }
    setContentSaving(true);
    setError(null);
    try {
      const blocks = JSON.parse(blocksDraft) as Array<Record<string, unknown>>;
      await authorizedFetch(`/api/admin/content/${selectedPageSlug}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: pageTitle,
          seoTitle: pageSeoTitle,
          seoDescription: pageSeoDescription,
          blocks,
        }),
      });
      await loadPageDetail(selectedPageSlug);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save page content.');
    } finally {
      setContentSaving(false);
    }
  };

  const handleSaveOverrides = async () => {
    setIsSavingOverrides(true);
    setError(null);
    try {
      const overrides = JSON.parse(productOverridesDraft) as Array<Record<string, unknown>>;
      await authorizedFetch('/api/admin/product-overrides', {
        method: 'PUT',
        body: JSON.stringify({ overrides }),
      });
      await loadProductOverrides();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to save product overrides.'
      );
    } finally {
      setIsSavingOverrides(false);
    }
  };

  const handleCatalogSync = async () => {
    setIsSyncingCatalog(true);
    setError(null);
    try {
      await authorizedFetch('/api/admin/catalog/sync', { method: 'POST' });
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Catalog sync failed.');
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('admin_access_token');
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Failed to sign out from Supabase:', signOutError);
    }
    router.replace('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 pt-[150px]">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-12 pt-[150px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Admin CMS</h1>
          <p className="text-gray-600">
            Signed in as {admin?.email ?? 'admin'} ({admin?.role ?? 'unknown role'})
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg border border-black px-4 py-2 text-sm font-semibold hover:bg-gray-100"
        >
          Sign out
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <section className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Square Catalog Sync</h2>
          <button
            type="button"
            onClick={handleCatalogSync}
            disabled={isSyncingCatalog}
            className="rounded-lg bg-cherry-pink px-4 py-2 text-sm font-semibold text-white hover:bg-cherry-pink-dark disabled:opacity-60"
          >
            {isSyncingCatalog ? 'Syncing...' : 'Sync Square Catalog'}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Pull latest Square products and pricing into the Supabase cache.
        </p>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Operational Settings</h2>
        <div className="space-y-6">
          {visibleSettings.map(({ key, draft }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{key}</h3>
                <button
                  type="button"
                  onClick={() => handleSaveSetting(key)}
                  disabled={settingsSavingKey === key}
                  className="rounded-md border border-black px-3 py-1 text-sm font-semibold hover:bg-gray-100 disabled:opacity-60"
                >
                  {settingsSavingKey === key ? 'Saving...' : 'Save'}
                </button>
              </div>
              <textarea
                value={draft}
                onChange={(event) =>
                  setSettingDrafts((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }))
                }
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-cherry-pink focus:outline-none"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Page Content</h2>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Page</label>
          <select
            value={selectedPageSlug}
            onChange={(event) => setSelectedPageSlug(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cherry-pink focus:outline-none"
          >
            {pages.map((page) => (
              <option key={page.slug} value={page.slug}>
                {page.slug}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
            <input
              value={pageTitle}
              onChange={(event) => setPageTitle(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cherry-pink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">SEO Title</label>
            <input
              value={pageSeoTitle}
              onChange={(event) => setPageSeoTitle(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cherry-pink focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">SEO Description</label>
          <textarea
            value={pageSeoDescription}
            onChange={(event) => setPageSeoDescription(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-cherry-pink focus:outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Content Blocks (JSON array)
          </label>
          <textarea
            value={blocksDraft}
            onChange={(event) => setBlocksDraft(event.target.value)}
            rows={12}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-cherry-pink focus:outline-none"
          />
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleSaveContent}
            disabled={contentSaving || !selectedPageSlug}
            className="rounded-lg bg-cherry-pink px-4 py-2 font-semibold text-white hover:bg-cherry-pink-dark disabled:opacity-60"
          >
            {contentSaving ? 'Saving...' : 'Save Page Content'}
          </button>
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Product Merchandising Overrides</h2>
        <p className="mb-3 text-sm text-gray-600">
          Edit visibility, featured ranking, copy, and image overrides as JSON.
        </p>
        <textarea
          value={productOverridesDraft}
          onChange={(event) => setProductOverridesDraft(event.target.value)}
          rows={12}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-cherry-pink focus:outline-none"
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSaveOverrides}
            disabled={isSavingOverrides}
            className="rounded-lg border border-black px-4 py-2 font-semibold hover:bg-gray-100 disabled:opacity-60"
          >
            {isSavingOverrides ? 'Saving...' : 'Save Product Overrides'}
          </button>
        </div>
      </section>
    </div>
  );
}
