export async function* readLines(stream: ReadableStream<Uint8Array>, signal?: AbortSignal) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  const abort = () => { void reader.cancel().catch(() => {}) }
  signal?.addEventListener('abort', abort, {once: true})
  try {
    if (signal?.aborted) return
    while (!signal?.aborted) {
      const {value, done} = await reader.read()
      pending += done ? decoder.decode() : decoder.decode(value, {stream: true})
      let end: number
      while ((end = pending.indexOf('\n')) !== -1) {
        if (signal?.aborted) return
        yield pending.slice(0, end).replace(/\r$/, '')
        pending = pending.slice(end + 1)
      }
      if (done) {
        if (pending && !signal?.aborted) yield pending.replace(/\r$/, '')
        return
      }
    }
  } finally {
    signal?.removeEventListener('abort', abort)
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
