import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const show = ref(false)
  const message = ref('')
  const color = ref('success')

  function notify(text: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    message.value = text
    color.value = type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'success'
    show.value = true
  }

  function success(text: string) {
    notify(text, 'success')
  }

  function error(text: string) {
    notify(text, 'error')
  }

  function warning(text: string) {
    notify(text, 'warning')
  }

  return { show, message, color, notify, success, error, warning }
})
