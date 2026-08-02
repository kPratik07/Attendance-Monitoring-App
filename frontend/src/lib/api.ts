const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('attendance_access_token');

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      throw new Error(payload?.message ?? response.statusText ?? 'Request failed');
    }

    return (payload?.data ?? payload) as T;
  } catch (caughtError) {
    if (caughtError instanceof Error && caughtError.message) {
      throw caughtError;
    }

    throw new Error('Unable to connect to the attendance service. Please try again.');
  }
}
