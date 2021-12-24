import loadFilters from './loadFilters'
import logEntry from './logEntry'
import shouldShowLogEntry from './shouldShowLogEntry'
import {start} from '../input/adb'
import {LogEntry} from '../types/log'

const main = async (filters: string[], config: object) => {
  // 1. Load filter modules
  const FILTER_MODULES = await loadFilters(config, filters)

  // 2. Start input reader listener
  start((entry: LogEntry): void => {
    // 2.1 Process onNewLine hooks
    for (const loggrepHandlerInstance of FILTER_MODULES) {
      loggrepHandlerInstance.hooks?.onNewLine(entry)
    }

    // 2.2 Ignore line if no one would show it
    if (!shouldShowLogEntry(FILTER_MODULES, entry)) {
      return
    }

    // 2.2 LOG IT!
    logEntry(entry)
  })
}

export default main
