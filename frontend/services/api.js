const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = (token, isJson = true) => {
  const headers = {};
  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

async function request(path, { method = "GET", body, token, isFormData = false } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: getHeaders(token, !isFormData),
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  register: (payload, token) => request("/auth/register", { method: "POST", body: payload, token }),
  me: (token) => request("/auth/me", { token }),
  listUsers: (token) => request("/auth/users", { token }),
  listCaseManagers: (token) => request("/auth/users/case-managers", { token }),
  updateUser: (id, payload, token) => request(`/auth/users/${id}`, { method: "PUT", body: payload, token }),
  createCase: (formData, token) => request("/cases", { method: "POST", body: formData, token, isFormData: true }),
  getCases: (token) => request("/cases", { token }),
  assignCase: (id, payload, token) => request(`/cases/${id}/assign`, { method: "PATCH", body: payload, token }),
  updateCase: (id, payload, token) => request(`/cases/${id}`, { method: "PATCH", body: payload, token }),
  getDigest: (token) => request("/cases/public/digest", { token }),
  getPolls: (token) => request("/polls", { token }),
  createPoll: (payload, token) => request("/polls", { method: "POST", body: payload, token }),
  votePoll: (id, payload, token) => request(`/polls/${id}/vote`, { method: "POST", body: payload, token }),
  getAnalytics: (token) => request("/analytics", { token }),
  getMinutes: (token, search = "") => request(`/minutes${search ? `?search=${encodeURIComponent(search)}` : ""}`, { token }),
  uploadMinutes: (formData, token) => request("/minutes", { method: "POST", body: formData, token, isFormData: true })
};
