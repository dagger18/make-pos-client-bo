import { $api } from '@/utils/api'

const InsuranceService = {
  // Policies
  list(params) {
    return $api(`insurance/policy${params ? `?${params}` : ''}`)
  },
  listPolicies(activeOnly = false) {
    return $api(`insurance/policy${activeOnly ? '?active=1' : ''}`)
  },
  getPolicy(id) {
    return $api(`insurance/policy/${id}`)
  },
  createPolicy(data) {
    return $api('insurance/policy', { method: 'POST', body: JSON.stringify(data) })
  },
  updatePolicy(id, data) {
    return $api(`insurance/policy/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deletePolicy(id) {
    return $api(`insurance/policy/${id}`, { method: 'DELETE' })
  },

  // Certificates
  listCertificates(shipmentId = null) {
    const qs = shipmentId ? `?shipmentId=${shipmentId}` : ''
    return $api(`insurance/certificate${qs}`)
  },
  getCertificate(id) {
    return $api(`insurance/certificate/${id}`)
  },
  calculatePremium(policyId, cargoValue) {
    return $api('insurance/certificate/calculate-premium', {
      method: 'POST',
      body: JSON.stringify({ policyId, cargoValue }),
    })
  },
  createCertificate(data) {
    return $api('insurance/certificate', { method: 'POST', body: JSON.stringify(data) })
  },
  updateCertificate(id, data) {
    return $api(`insurance/certificate/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  cancelCertificate(id) {
    return $api(`insurance/certificate/${id}/cancel`, { method: 'POST' })
  },
  deleteCertificate(id) {
    return $api(`insurance/certificate/${id}`, { method: 'DELETE' })
  },

  // Claims
  listClaims(certificateId = null) {
    const qs = certificateId ? `?certificateId=${certificateId}` : ''
    return $api(`insurance/claim${qs}`)
  },
  getClaim(id) {
    return $api(`insurance/claim/${id}`)
  },
  createClaim(data) {
    return $api('insurance/claim', { method: 'POST', body: JSON.stringify(data) })
  },
  updateClaim(id, data) {
    return $api(`insurance/claim/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteClaim(id) {
    return $api(`insurance/claim/${id}`, { method: 'DELETE' })
  },

  // Declarations
  listDeclarations(params) {
    return $api(`insurance/declaration${params ? `?${params}` : ''}`)
  },
  createDeclaration(data) {
    return $api('insurance/declaration', { method: 'POST', body: JSON.stringify(data) })
  },
  submitDeclaration(id) {
    return $api(`insurance/declaration/${id}/submit`, { method: 'POST' })
  },
  acknowledgeDeclaration(id) {
    return $api(`insurance/declaration/${id}/acknowledge`, { method: 'POST' })
  },
  deleteDeclaration(id) {
    return $api(`insurance/declaration/${id}`, { method: 'DELETE' })
  },
}

export default InsuranceService
