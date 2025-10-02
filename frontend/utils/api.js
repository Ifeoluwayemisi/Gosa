export const fetcher = async (endpoint, options = {}) => {
  const base = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, ""); // remove trailing slash
  const path = endpoint.replace(/^\/+/, ""); // remove leading slash

  const res = await fetch(`${base}/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
};
