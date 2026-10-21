import type {LogEntry, LogLevel} from '../types/log'
import {readLines} from './lines'

const LOG_LINE_EPOCH = /^\s*(\d+(?:\.\d+)?)\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+(.*?)\s*: (.*)$/

export function parseLogEntry(line: string): LogEntry | undefined {
  const match = LOG_LINE_EPOCH.exec(line)
  if (!match) return
  const [, epoch, pid, tid, level, tag, message] = match
  const date = new Date(Number(epoch) * 1000)
  if (!Number.isFinite(date.getTime())) return
  return {line, epoch: date, pid, tid, level: level as LogLevel, tag, message}
}

export async function start(
  callback: (entry: LogEntry) => void,
  input: string | undefined,
  shouldReset: boolean,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted) return
  if (input !== undefined) {
    for await (const line of readLines(Bun.file(input).stream(), signal)) {
      const entry = parseLogEntry(line)
      if (entry) callback(entry)
    }
    return
  }

  if (shouldReset) {
    const reset = Bun.spawn(['adb', 'logcat', '-c'], {stdout: 'ignore', stderr: 'pipe'})
    const abortReset = () => { reset.kill() }
    signal?.addEventListener('abort', abortReset, {once: true})
    try {
      const [code, stderr] = await Promise.all([reset.exited, new Response(reset.stderr).text()])
      if (signal?.aborted) return
      if (code !== 0) throw new Error(`adb logcat reset exited with code ${code}: ${stderr.trim()}`)
    } finally {
      signal?.removeEventListener('abort', abortReset)
    }
  }
  if (signal?.aborted) return
  const adb = Bun.spawn(['adb', 'logcat', '-v', 'threadtime', '-v', 'epoch'], {
    stdout: 'pipe', stderr: 'pipe',
  })
  const abort = () => { adb.kill() }
  signal?.addEventListener('abort', abort, {once: true})
  // Drain stderr concurrently so a noisy adb cannot block stdout.
  const diagnostics = (async () => {
    for await (const line of readLines(adb.stderr)) console.error(`adb: ${line}`)
  })()
  // Attach a rejection handler immediately; propagate it after stream cleanup.
  void diagnostics.catch(() => { adb.kill() })
  try {
    for await (const line of readLines(adb.stdout, signal)) {
      const entry = parseLogEntry(line)
      if (entry) callback(entry)
    }
    const code = await adb.exited
    await diagnostics
    if (!signal?.aborted && code !== 0) throw new Error(`adb logcat exited with code ${code}`)
  } finally {
    signal?.removeEventListener('abort', abort)
    adb.kill()
    await adb.exited
    await diagnostics
  }
}
