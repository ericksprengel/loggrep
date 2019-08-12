import { exec } from 'child_process'
import readline from 'readline'
import util from 'util'

const execP = util.promisify(exec)
// I/TAG   ( 1234): message: fruit=banana?
const PS_LINE  = /^([A-Z])\/\s*(\S*)\s*\( *(\d+)\): (.*)$/

// input
const loadPids = async (callback) => {
  const {error, stdout, stderr} = await execP('adb shell ps')
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  return '9195'
}

export {
  loadPids,
}
