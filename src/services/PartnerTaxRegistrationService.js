export default {
  listByPartner: (partnerId) => $api(`/partner/${partnerId}/tax-registration`),
  create: (partnerId, data) => $api(`/partner/${partnerId}/tax-registration`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  update: (id, data) => $api(`/tax-registration/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  remove: (id) => $api(`/tax-registration/${id}`, { method: 'DELETE' }),
}
