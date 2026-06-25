import { ref } from 'vue'

export function useMinDelay(minMs = 400) {
  const loading = ref(true)

  async function wrap<T>(promise: Promise<T>): Promise<T> {
    loading.value = true
    const start = Date.now()
    const [result] = await Promise.all([
      promise,
      new Promise<void>(r => setTimeout(r, minMs)),
    ])
    const elapsed = Date.now() - start
    if (elapsed < minMs) {
      await new Promise<void>(r => setTimeout(r, minMs - elapsed))
    }
    loading.value = false
    return result
  }

  return { loading, wrap }
}
