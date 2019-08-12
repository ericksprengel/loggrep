import { exec } from 'child_process'
import readline from 'readline'
import util from 'util'

const execP = util.promisify(exec)
// USER           PID  PPID     VSZ    RSS WCHAN            ADDR S NAME
// u0_a85        9195  1759 1885328 361580 0                   0 S br.com.stone.mais.development
const PS_LINE  = /^(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/

// input
const loadPids = async (packages) => {
  const {error, stdout, stderr} = await execP('adb shell ps')
  if (error) {
    console.error(`exec error: ${error}`);
    process.exit(1);
  }
  const pids = []
  for (let line of stdout.split(/\r?\n/)) {
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
