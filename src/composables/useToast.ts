import { toastController } from '@ionic/vue'

export function useToast() {
  async function showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success', duration = 2500) {
    const toast = await toastController.create({
      message,
      duration,
      color,
      position: 'bottom',
      cssClass: 'app-toast',
    })
    await toast.present()
  }

  return { showToast }
}
