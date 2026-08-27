const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Automatically attach active authenticated user context headers for backend RBAC
  try {
    const savedUser = localStorage.getItem('financetwin_active_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email) {
        headers.set('X-User-Email', user.email);
      }
      if (user.role) {
        headers.set('X-User-Role', user.role);
      }
    }
  } catch (e) {
    // Ignore localStorage parse errors in non-browser environments
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) {
        errorMessage = parsed.detail;
      }
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
