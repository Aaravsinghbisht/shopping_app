const API = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  employees: {
    list: () => request('/employees'),
    create: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (invoiceNumber, data) => request(`/orders/${invoiceNumber}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (invoiceNumber) => request(`/orders/${invoiceNumber}`, { method: 'DELETE' }),
  },
  products: {
    list: () => request('/products'),
  },
};
