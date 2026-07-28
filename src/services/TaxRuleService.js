export default {
  list: (params) => $api(`/tax-rule${params ? `?${params}` : ''}`),
  get: (id) => $api(`/tax-rule/${id}`),
  lookup: (params) => $api(`/tax-rule/lookup?${new URLSearchParams(params)}`),
  create: (data) => $api('/tax-rule', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  update: (id, data) => $api(`/tax-rule/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  remove: (id) => $api(`/tax-rule/${id}`, { method: 'DELETE' }),
}
