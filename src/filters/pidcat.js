import log from '../utils/log.js'
import { loadPids } from '../utils/adb/index.js'
const APP_START = /ADD_APP_START/
const APP_END = /ADD_APP_END/

export default async ({ packages = [] }) => {
  let PIDS = await loadPids(packages)
  log.i('PIDS:', PIDS)


  const pidcatFilter = ({line, level, tag, pid, message}) => {
    return PIDS.includes(pid)
  }

  const onNewLine = ({line, level, tag, pid, message}) => {
    // TODO: update PIDS
    if (APP_END.test(message)) {
      PIDS = PIDS.filter(pidCached => pidCached !== pid)
    } else if (APP_START.test(message)) {
      PIDS = [
        ...PIDS,
        pid,
      ]
    }
  }

  const hooks = {
    onNewLine,
  }
  const filters = [
    pidcatFilter
  ]

  return {
    hooks,
    filters,
  }
}