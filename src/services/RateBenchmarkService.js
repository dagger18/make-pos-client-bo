const BASE = 'rate-benchmark'

export default {
  buyComparison(mode = '', containerType = '') {
    const p = new URLSearchParams()
    if (mode)          p.set('mode', mode)
    if (containerType) p.set('container_type', containerType)
    return $api(`${BASE}/buy?${p}`)
  },

  sellComparison(from, to, mode = '') {
    const p = new URLSearchParams({ from, to })
    if (mode) p.set('mode', mode)
    return $api(`${BASE}/sell?${p}`)
  },

  trend(pol, pod, containerType = '', days = 180) {
    const p = new URLSearchParams({ pol, pod, days: String(days) })
    if (containerType) p.set('container_type', containerType)
    return $api(`${BASE}/trend?${p}`)
  },
}
