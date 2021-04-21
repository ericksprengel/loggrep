import loadFilters from './loadFilters'
import logEntry from './logEntry'
import shouldShowLogEntry from './shouldShowLogEntry'
import {start} from '../input/adb'
import {LogEntry} from '../types/log'

const main = async (filters: string[], config: object) => {
  // 1. LOAD FILTER MODULES
  const FILTER_MODULES = await loadFilters(config, filters)

  // 2. START INPUT READER LISTENER
  start((entry: LogEntry): void => {
    // 2.1 IGNORE LINE IF NO ONE WOULD SHOW IT
    if (!shouldShowLogEntry(FILTER_MODULES, entry)) {
      return
    }

    // 2.2 LOG IT!
    logEntry(entry)
  })
}

export default main
