<script setup>
import NotificationService from '@/services/NotificationService'

const notifications = ref([])
const loading = ref(false)

async function loadNotifications() {
  loading.value = true
  try {
    const result = await NotificationService.getNotifications(1)
    notifications.value = (result?.list ?? []).map(n => ({
      id:       n.id,
      title:    n.title,
      subtitle: n.body,
      time:     n.createdDate ? new Date(n.createdDate).toLocaleDateString() : '',
      isSeen:   n.isRead,
      icon:     'tabler-bell',
      color:    (n.priority === 'HIGH' || n.priority === 'URGENT') ? 'error' : 'primary',
    }))
  } finally {
    loading.value = false
  }
}

onMounted(loadNotifications)

const removeNotification = async (notificationId) => {
  await NotificationService.markRead([notificationId])
  notifications.value = notifications.value.filter(n => n.id !== notificationId)
}

const markRead = async (ids) => {
  await NotificationService.markRead(ids)
  notifications.value.forEach(n => { if (ids.includes(n.id)) n.isSeen = true })
}

const markUnRead = (ids) => {
  notifications.value.forEach(n => { if (ids.includes(n.id)) n.isSeen = false })
}

const handleNotificationClick = (notification) => {
  if (!notification.isSeen) markRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
  />
</template>
