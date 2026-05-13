const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
    this.accessToken = null;
  }

  setToken(token) { this.accessToken = token; }
  clearToken() { this.accessToken = null; }

  async request(method, path, body = null, opts = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;

    const config = {
      method,
      credentials: 'include', // for httpOnly cookies
      headers,
      ...opts,
    };

    if (body && !(body instanceof FormData)) {
      config.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      delete config.headers['Content-Type']; // let browser set multipart boundary
      config.body = body;
    }

    const res = await fetch(`${this.baseUrl}${path}`, config);

    // Auto-refresh on 401
    if (res.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
      const refreshed = await this.refresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        config.headers = headers;
        const retryRes = await fetch(`${this.baseUrl}${path}`, config);
        return retryRes.json();
      }
    }

    const data = await res.json();
    if (!res.ok) throw { status: res.status, message: data.message || 'Request failed', errors: data.errors };
    return data;
  }

  async refresh() {
    try {
      const data = await this.request('POST', '/auth/refresh');
      if (data?.data?.accessToken) {
        this.setToken(data.data.accessToken);
        return true;
      }
    } catch { return false; }
    return false;
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  put(path, body) { return this.request('PUT', path, body); }
  delete(path) { return this.request('DELETE', path); }

  postForm(path, formData) { return this.request('POST', path, formData); }
}

export const api = new ApiClient();
