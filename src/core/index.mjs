import loadFilters from './loadFilters.mjs'
import logEntry from './logEntry.mjs'
import shouldShowLogEntry from './shouldShowLogEntry.mjs'
import { start } from '../input/adb.mjs'

const main = async (filters, config) => {

  // 1. LOAD FILTER MODULES
  let FILTER_MODULES
  FILTER_MODULES = await loadFilters(config, filters)

  // 2. START INPUT READER LISTENER
  start((line, level, tag, pid, message) => {

    // 2.1 IGNORE LINE IF NO ONE WOULD SHOW IT
    if (!shouldShowLogEntry({
        filterModules: FILTER_MODULES,
        line,
        level,
        tag,
        pid,
        message,
    })) {
      return
    }

    // 2.2 LOG IT!
    logEntry({level, tag, pid, message})
  })
}

export default main