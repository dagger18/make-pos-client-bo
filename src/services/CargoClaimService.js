export default {
  list: (params) => $api(`/cargo-claim${params ? `?${params}` : ''}`),
  get: (id) => $api(`/cargo-claim/${id}`),
  create: (data) => $api('/cargo-claim', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  update: (id, data) => $api(`/cargo-claim/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  remove: (id) => $api(`/cargo-claim/${id}`, { method: 'DELETE' }),
}
