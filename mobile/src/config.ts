export const WEB_BASE_URL = 'https://jwonder-health-ai-coach.vercel.app';

export type AppTabId = 'home' | 'routine' | 'records' | 'profile';

export const TAB_PATHS: Record<AppTabId, string> = {
  home: '/',
  routine: '/program',
  records: '/performance',
  profile: '/settings',
};

export function urlForTab(tab: AppTabId): string {
  const path = TAB_PATHS[tab];
  if (path === '/') return WEB_BASE_URL;
  return `${WEB_BASE_URL}${path}`;
}

export function tabFromPathname(pathname: string): AppTabId | null {
  const p = pathname.split('?')[0] ?? '/';
  if (p === '/' || p === '') return 'home';
  if (p.startsWith('/program') || p.startsWith('/workout')) return 'routine';
  if (p.startsWith('/records') || p.startsWith('/performance')) return 'records';
  if (p.startsWith('/settings')) return 'profile';
  return null;
}
