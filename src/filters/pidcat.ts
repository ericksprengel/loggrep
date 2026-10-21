import type {LoggrepHandler} from '../types/log'
import {loadPids} from '../utils/adb'

const APP_START = /ADD_APP_START/
const APP_END = /ADD_APP_END/

export const handler: LoggrepHandler = async config => {
  const packages = config.packages ?? []
  if (!Array.isArray(packages) || !packages.every(name => typeof name === 'string')) {
    throw new Error('pidcat config.packages must be an array of package names')
  }
  let pids = await loadPids(packages)
  return {
    filters: [entry => pids.includes(entry.pid)],
    hooks: {
      onNewLine: entry => {
        if (entry.message && APP_END.test(entry.message)) {
          pids = pids.filter(pid => pid !== entry.pid)
        } else if (entry.message && APP_START.test(entry.message)) {
          pids = [...new Set([...pids, entry.pid])]
        }
      },
    },
  }
}
