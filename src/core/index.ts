import loadFilters from './loadFilters'
import logEntry from './logEntry'
import shouldShowLogEntry from './shouldShowLogEntry'
import {start} from '../input/adb'
import type {LogEntry, LoggrepConfig} from '../types/log'

const main = async (
  filters: string[],
  config: LoggrepConfig,
  input: string | undefined,
  shouldReset: boolean,
  signal?: AbortSignal,
): Promise<void> => {
  const modules = await loadFilters(config, filters)
  if (signal?.aborted) return
  await start((entry: LogEntry) => {
    for (const module of modules) module.hooks?.onNewLine?.(entry)
    if (!shouldShowLogEntry(modules, entry)) return
    for (const module of modules) module.hooks?.onLineMatch?.(entry)
    logEntry(entry)
  }, input, shouldReset, signal)
}

export default main
