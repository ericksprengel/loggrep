/* eslint-disable unicorn/filename-case */
import {exec} from 'child_process'
import * as util from 'util'
import log from '../log'

const execP = util.promisify(exec)
// USER           PID  PPID     VSZ    RSS WCHAN            ADDR S NAME
// u0_a85        9195  1759 1885328 361580 0                   0 S br.com.stone.mais.development
// u0_a296   25404 288   1456592 204380 ffffffff 00000000 S br.com.stone.mais.development
const PS_LINE  = /^(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\d+)\s+(\S+)\s+(.*)$/

// input
const loadPids = async (packages: string[]) => {
  const {error, stdout} = await execP('adb shell ps')
  if (error) {
    log.e(`exec error: ${error}`)
    process.exit(1)
  }
  const pids = []
  for (const line of stdout.split(/\r?\n/)) {
    const res = PS_LINE.exec(line) || []
    const pid = res[2]
    const name = res[9]
    if (packages.includes(name)) {
      pids.push(pid)
    }
  }
  return pids
}

export {
  loadPids,
}
