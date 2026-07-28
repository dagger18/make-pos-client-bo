export default {
  getScores: (year, month, mode) => {
    const params = new URLSearchParams({ year, month })
    if (mode) params.append('mode', mode)
    return $api(`/carrier-performance/scores?${params}`)
  },
  getLatest: (carrierId, mode) => {
    const params = mode ? `?mode=${mode}` : ''
    return $api(`/carrier-performance/${carrierId}/latest${params}`)
  },
  getHistory: (carrierId, mode) => {
    const params = mode ? `?mode=${mode}` : ''
    return $api(`/carrier-performance/${carrierId}/history${params}`)
  },
}
