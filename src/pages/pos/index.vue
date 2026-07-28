<template>
  <VRow no-gutters style="height: calc(100vh - 64px)">

    <!-- ── Product panel ──────────────────────────────────────── -->
    <VCol cols="12" md="8" class="pa-3 overflow-y-auto h-100">
      <VTextField v-model="search" label="Search products…" clearable density="compact"
        prepend-inner-icon="tabler-search" class="mb-3" />

      <!-- Category chips -->
      <div class="d-flex flex-wrap gap-2 mb-3">
        <VChip :color="activeCat === null ? 'primary' : 'default'" @click="activeCat = null" clickable>
          All
        </VChip>
        <VChip
          v-for="cat in categories"
          :key="cat.id"
          :color="activeCat === cat.id ? 'primary' : 'default'"
          @click="activeCat = cat.id"
          clickable
        >{{ cat.name }}</VChip>
      </div>

      <!-- Product grid -->
      <VRow dense>
        <VCol
          v-for="p in filteredProducts"
          :key="p.id"
          cols="6" sm="4" md="3"
        >
          <VCard
            hover
            class="cursor-pointer text-center pa-3"
            height="110"
            @click="onProductTap(p)"
          >
            <VIcon icon="tabler-package" size="32" color="primary" class="mb-1" />
            <div class="text-body-2 font-weight-medium text-truncate">{{ p.name }}</div>
            <div class="text-caption text-disabled">{{ p.sku }}</div>
            <div class="text-subtitle-2 text-primary">{{ Number(p.price).toFixed(2) }}</div>
          </VCard>
        </VCol>
        <VCol v-if="!filteredProducts.length" cols="12" class="text-center text-disabled py-8">
          No products found
        </VCol>
      </VRow>
    </VCol>

    <!-- ── Cart panel ─────────────────────────────────────────── -->
    <VCol cols="12" md="4" class="d-flex flex-column border-s" style="height: 100%">
      <div class="pa-3 d-flex align-center">
        <span class="text-subtitle-1 font-weight-bold">Cart</span>
        <VSpacer />
        <VBtn v-if="cart.length" size="small" variant="text" color="error" @click="cart = []">
          Clear
        </VBtn>
      </div>
      <VDivider />

      <!-- Cart items -->
      <div class="flex-grow-1 overflow-y-auto pa-2">
        <div v-if="!cart.length" class="text-center text-disabled py-8">Cart is empty</div>
        <VCard
          v-for="(item, i) in cart"
          :key="i"
          variant="outlined"
          class="mb-2 pa-2"
        >
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-medium">{{ item.productName }}</div>
              <div v-if="item.modifiers?.length" class="text-caption text-disabled">
                + {{ item.modifiers.map(m => m.name).join(', ') }}
              </div>
              <div class="text-caption text-primary">
                {{ Number(item.unitPrice).toFixed(2) }} × {{ item.quantity }}
              </div>
            </div>
            <div class="d-flex align-center gap-1">
              <VBtn icon size="x-small" variant="tonal" @click="changeQty(i, -1)">
                <VIcon icon="tabler-minus" size="14" />
              </VBtn>
              <span class="text-body-2 mx-1">{{ item.quantity }}</span>
              <VBtn icon size="x-small" variant="tonal" @click="changeQty(i, 1)">
                <VIcon icon="tabler-plus" size="14" />
              </VBtn>
              <VBtn icon size="x-small" variant="text" color="error" class="ml-1" @click="cart.splice(i, 1)">
                <VIcon icon="tabler-x" size="14" />
              </VBtn>
            </div>
          </div>
          <div class="text-right text-subtitle-2 mt-1">
            {{ Number(item.unitPrice * item.quantity).toFixed(2) }}
          </div>
        </VCard>
      </div>
      <VDivider />

      <!-- Totals -->
      <div class="pa-3">
        <div class="d-flex justify-space-between mb-1 text-body-2">
          <span class="text-disabled">Subtotal</span>
          <span>{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="d-flex justify-space-between mb-3 text-h6 font-weight-bold">
          <span>Total</span>
          <span>{{ subtotal.toFixed(2) }}</span>
        </div>
        <VTextField v-model="notes" label="Notes (optional)" density="compact" class="mb-3" />
        <VBtn
          block
          color="primary"
          size="large"
          :disabled="!cart.length"
          @click="chargeDialog = true"
        >
          Charge {{ subtotal.toFixed(2) }}
        </VBtn>
      </div>
    </VCol>
  </VRow>

  <!-- ── Modifier dialog (food products) ───────────────────────── -->
  <VDialog v-model="modDialog" max-width="420" scrollable>
    <VCard>
      <VCardTitle>{{ pendingProduct?.name }}</VCardTitle>
      <VCardText>
        <div v-if="loadingMod" class="text-center py-4"><VProgressCircular indeterminate /></div>
        <template v-else>
          <div v-for="group in pendingGroups" :key="group.id" class="mb-4">
            <p class="text-subtitle-2 mb-2">
              {{ group.name }}
              <VChip size="x-small" class="ml-1" :color="group.required ? 'error' : 'default'">
                {{ group.required ? 'required' : 'optional' }}
              </VChip>
            </p>
            <VCheckboxBtn
              v-for="mod in group.modifiers"
              :key="mod.id"
              v-model="selectedMods"
              :value="{ name: mod.name, price_delta: mod.price_delta }"
              :label="`${mod.name} (${Number(mod.price_delta) >= 0 ? '+' : ''}${Number(mod.price_delta).toFixed(2)})`"
            />
          </div>
          <div v-if="!pendingGroups.length" class="text-disabled text-center">No modifier groups</div>
        </template>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="modDialog = false">Cancel</VBtn>
        <VBtn color="primary" @click="confirmAdd">Add to Cart</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ── Charge dialog ─────────────────────────────────────────── -->
  <VDialog v-model="chargeDialog" max-width="380">
    <VCard>
      <VCardTitle>Payment</VCardTitle>
      <VCardText>
        <VBtnToggle v-model="payMethod" mandatory class="mb-4" density="compact">
          <VBtn value="cash">Cash</VBtn>
          <VBtn value="card">Card</VBtn>
          <VBtn value="qr_code">QR</VBtn>
          <VBtn value="other">Other</VBtn>
        </VBtnToggle>
        <VTextField v-model.number="payAmount" label="Amount received" type="number"
          step="0.01" prefix="$" class="mb-2" />
        <div v-if="payMethod === 'cash' && payAmount > subtotal" class="text-success font-weight-medium">
          Change: ${{ (payAmount - subtotal).toFixed(2) }}
        </div>
        <VTextField v-if="payMethod !== 'cash'" v-model="payReference"
          label="Reference (optional)" class="mt-2" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="chargeDialog = false">Cancel</VBtn>
        <VBtn color="primary" :loading="charging" @click="submitOrder">Confirm</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ── Success snackbar ───────────────────────────────────────── -->
  <VSnackbar v-model="successSnack" color="success" timeout="3000">
    Order #{{ lastOrderId }} created and paid!
  </VSnackbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CatalogService from '@/services/CatalogService'
import SalesService from '@/services/SalesService'

// ── State ──────────────────────────────────────────────────────────
const products   = ref([])
const categories = ref([])
const activeCat  = ref(null)
const search     = ref('')
const cart       = ref([])
const notes      = ref('')

// Modifier dialog
const modDialog      = ref(false)
const loadingMod     = ref(false)
const pendingProduct = ref(null)
const pendingGroups  = ref([])
const selectedMods   = ref([])

// Charge dialog
const chargeDialog = ref(false)
const payMethod    = ref('cash')
const payAmount    = ref(0)
const payReference = ref('')
const charging     = ref(false)

// Success
const successSnack = ref(false)
const lastOrderId  = ref(null)

// ── Computed ───────────────────────────────────────────────────────
const filteredProducts = computed(() => {
  let list = products.value
  if (activeCat.value !== null) {
    list = list.filter(p => p.category_id === activeCat.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  return list
})

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
)

// ── Load data ──────────────────────────────────────────────────────
onMounted(async () => {
  const [catRes, prodRes] = await Promise.all([
    CatalogService.listCategories(),
    CatalogService.listProducts('active=1&limit=500'),
  ])
  categories.value = catRes?.list ?? catRes ?? []
  products.value   = prodRes?.list ?? prodRes ?? []
})

// ── Product tap ────────────────────────────────────────────────────
const onProductTap = async (product) => {
  if (product.type === 'food') {
    pendingProduct.value = product
    selectedMods.value   = []
    pendingGroups.value  = []
    modDialog.value      = true
    loadingMod.value     = true
    try {
      const detail = await CatalogService.getProduct(product.id)
      pendingGroups.value = detail?.modifier_groups ?? []
    } finally {
      loadingMod.value = false
    }
  } else {
    addToCart(product, [])
  }
}

const confirmAdd = () => {
  addToCart(pendingProduct.value, selectedMods.value)
  modDialog.value = false
}

const addToCart = (product, modifiers) => {
  const modDelta = modifiers.reduce((sum, m) => sum + Number(m.price_delta), 0)
  const unitPrice = Number(product.price) + modDelta

  // Merge with existing cart item if same product + same modifier set
  const key = product.id + '|' + JSON.stringify(modifiers)
  const existing = cart.value.find(i => i._key === key)
  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({
      _key: key,
      productId:   product.id,
      productName: product.name,
      productSku:  product.sku,
      unitPrice,
      quantity: 1,
      modifiers: modifiers.length ? modifiers : null,
    })
  }
}

const changeQty = (i, delta) => {
  cart.value[i].quantity += delta
  if (cart.value[i].quantity <= 0) cart.value.splice(i, 1)
}

// ── Submit order ───────────────────────────────────────────────────
const submitOrder = async () => {
  if (!cart.value.length) return
  charging.value = true
  try {
    const payload = {
      notes: notes.value || null,
      items: cart.value.map(item => ({
        product_id:  item.productId,
        product_name: item.productName,
        product_sku:  item.productSku,
        quantity:    item.quantity,
        unit_price:  item.unitPrice,
        modifiers:   item.modifiers ?? [],
      })),
    }

    const created = await SalesService.createOrder(payload)
    const orderId = created?.id
    if (!orderId) throw new Error('No order ID returned')

    await SalesService.addPayment(orderId, {
      method:    payMethod.value,
      amount:    payAmount.value,
      reference: payReference.value || null,
    })

    lastOrderId.value  = orderId
    successSnack.value = true
    cart.value   = []
    notes.value  = ''
    payAmount.value   = 0
    payReference.value = ''
    chargeDialog.value = false
  } finally {
    charging.value = false
  }
}
</script>
