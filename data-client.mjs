export function createDataClient({ fetch, messages }) {
  async function request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers ?? {}),
      },
    });
    if (response.status === 401) throw new Error(messages.loginRequired());
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || data.error || messages.requestFailed());
    }
    return data;
  }

  return { request };
}
