export default {
  listByPartner: (partnerId) => $api(`/partner/${partnerId}/tax-exemption`),
  create: (partnerId, data) => $api(`/partner/${partnerId}/tax-exemption`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  update: (id, data) => $api(`/tax-exemption/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  remove: (id) => $api(`/tax-exemption/${id}`, { method: 'DELETE' }),
}
