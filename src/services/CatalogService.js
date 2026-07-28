import CommonService from '@/services/CommonService'

export default {
  // ── Categories ──────────────────────────────────────────────────────────
  listCategories(params = '') {
    return $api(`product-category?${params}`)
  },
  createCategory(data) {
    return $api('product-category', { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  updateCategory(data) {
    return $api(`product-category/${data.id}`, { method: 'PUT', body: CommonService.formData(data), loading: true })
  },
  deleteCategory(id) {
    return $api(`product-category/${id}`, { method: 'DELETE', loading: true })
  },

  // ── Products ─────────────────────────────────────────────────────────────
  listProducts(params = '') {
    return $api(`product?${params}`)
  },
  getProduct(id) {
    return $api(`product/${id}`)
  },
  createProduct(data) {
    return $api('product', { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  updateProduct(data) {
    return $api(`product/${data.id}`, { method: 'PUT', body: CommonService.formData(data), loading: true })
  },
  deleteProduct(id) {
    return $api(`product/${id}`, { method: 'DELETE', loading: true })
  },

  // ── Modifier Groups ───────────────────────────────────────────────────────
  listModifierGroups(params = '') {
    return $api(`modifier-group?${params}`)
  },
  getModifierGroup(id) {
    return $api(`modifier-group/${id}`)
  },
  createModifierGroup(data) {
    return $api('modifier-group', { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  updateModifierGroup(data) {
    return $api(`modifier-group/${data.id}`, { method: 'PUT', body: CommonService.formData(data), loading: true })
  },
  deleteModifierGroup(id) {
    return $api(`modifier-group/${id}`, { method: 'DELETE', loading: true })
  },

  // ── Modifiers (within a group) ────────────────────────────────────────────
  addModifier(groupId, data) {
    return $api(`modifier-group/${groupId}/modifier`, { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  updateModifier(groupId, mid, data) {
    return $api(`modifier-group/${groupId}/modifier/${mid}`, { method: 'PUT', body: CommonService.formData(data), loading: true })
  },
  deleteModifier(groupId, mid) {
    return $api(`modifier-group/${groupId}/modifier/${mid}`, { method: 'DELETE', loading: true })
  },

  // ── Product–ModifierGroup relationships ───────────────────────────────────
  attachModifierGroup(productId, groupId) {
    return $api(`product/${productId}/modifier-group/${groupId}`, { method: 'POST', loading: true })
  },
  detachModifierGroup(productId, groupId) {
    return $api(`product/${productId}/modifier-group/${groupId}`, { method: 'DELETE', loading: true })
  },

  // ── Product custom modifiers ──────────────────────────────────────────────
  addProductModifier(productId, data) {
    return $api(`product/${productId}/modifier`, { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  updateProductModifier(productId, mid, data) {
    return $api(`product/${productId}/modifier/${mid}`, { method: 'PUT', body: CommonService.formData(data), loading: true })
  },
  deleteProductModifier(productId, mid) {
    return $api(`product/${productId}/modifier/${mid}`, { method: 'DELETE', loading: true })
  },
}
