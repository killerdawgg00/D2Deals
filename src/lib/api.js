const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.');
  return payload;
}

export const api = {
  vehicles: (query = '') => request(`/vehicles${query}`),
  createVehicle: (data, token) => request('/admin/vehicles', {
    method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` },
  }),
  updateVehicle: (id, data, token) => request(`/admin/vehicles/${id}`, {
    method: 'PATCH', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` },
  }),
  createBid: (data) => request('/bids', { method: 'POST', body: JSON.stringify(data) }),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  dashboard: (token) => request('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
  updateOrder: (id, status, token) => request(`/admin/orders/${id}`, {
    method: 'PATCH', body: JSON.stringify({ status }), headers: { Authorization: `Bearer ${token}` },
  }),
};
