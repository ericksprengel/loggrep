import { spawn } from 'child_process'
import readline from 'readline'

const APP_START = /ADD_APP_START/
const APP_END = /ADD_APP_END/

const loadPidsByPackage = () => {
  // adb shell ps
}

export default async ({ packages = [] }) => {
  let PIDS = loadPidsByPackages(packages)

  const pidcatFilter = (line, level, tag, pid, message) => {
    return PIDS.includes(pid)
  }

  const onNewLine = (line, level, tag, pid, message) => {
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