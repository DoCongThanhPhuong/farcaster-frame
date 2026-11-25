export function resolveBaseUrl(
  hdrs?: { get(name: string): string | null } | null,
  fallback = 'localhost:3000'
): string {
  const host =
    process.env.NEXT_PUBLIC_HOST ||
    hdrs?.get('x-forwarded-host') ||
    hdrs?.get('host') ||
    fallback;
  if (host.startsWith('http')) return host;
  const proto = hdrs?.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}
