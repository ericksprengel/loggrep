import log from '../utils/log'
import {LogEntry, LoggrepConfig, LoggrepHandler} from '../types/log'
import {loadPids} from '../utils/adb'

const APP_START = /ADD_APP_START/
const APP_END = /ADD_APP_END/

export const handler: LoggrepHandler = async (config: LoggrepConfig) => {
  const packages: string[] = config?.packages ?? []
  let PIDS = await loadPids(packages)
  log.i('PIDS:', PIDS)

  const pidcatFilter = (logEntry: LogEntry) => {
    return PIDS.includes(logEntry.pid)
  }

  const onNewLine = (logEntry: LogEntry) => {
    // TODO: update PIDS
    if (logEntry.message && APP_END.test(logEntry.message)) {
      PIDS = PIDS.filter(pidCached => pidCached !== logEntry.pid)
    } else if (logEntry.message && APP_START.test(logEntry.message)) {
      PIDS = [
        ...PIDS,
        logEntry.pid,
      ]
    }
  }

  const hooks = {
    onNewLine,
  }
  const filters = [
    pidcatFilter,
  ]

  return {
    hooks,
    filters,
  }
}
