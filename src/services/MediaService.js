import { baseApiUrl } from '@/utils/api'
const BASE_URI = 'media'

export default {
  presign({ filename, mimeType, size }) {
    return $api(`${BASE_URI}/presign`, {
      method: 'POST',
      body: JSON.stringify({ filename, mimeType, size }),
      headers: { 'Content-Type': 'application/json' },
    })
  },

  confirm({ confirmToken, ...parentBind }) {
    return $api(`${BASE_URI}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ confirmToken, ...parentBind }),
      headers: { 'Content-Type': 'application/json' },
    })
  },

  delete(id, parent = {}) {
    return $api(`${BASE_URI}/${id}` + (parent ? ('?' + new URLSearchParams(parent).toString()) : ''), {
      method: 'DELETE',
      loading: true
    }).catch((err) => {
      return { error: err }
    })
  },

  update(id, data) {
    return $api(`${BASE_URI}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  },

  async download(id) {
    const response = await $api(`${BASE_URI}/${id}/download-url`)
    if (response?.token) {
      window.open(`${baseApiUrl}/public/media/serve/${response.token}`, '_blank')
    }
  }
}
