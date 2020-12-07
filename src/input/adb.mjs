import { spawn } from 'child_process'
import readline from 'readline'

// I/TAG   ( 1234): message: fruit=banana?
const LOG_LINE  = /^([A-Z])\/\s*(\S*)\s*\( *(\d+)\): (.*)$/

// input
const start = (callback) => {
  const adb = spawn('adb', ['logcat', '-v', 'brief']);

  const rl = readline.createInterface({
    input: adb.stdout,
  })

  rl.on('line', (line) => {
  // adb.stdout.on('data', (data) => {
    const res = LOG_LINE.exec(line)
    if (!res) {
      // console.log('IGNORING: ', line)
      return
    }
    const [
      fullMatch,
      level,
      tag,
      pid,
      message,
    ] = res

    if (line !== fullMatch) {
      process.exit(1)
    }
    callback(line, level, tag, pid, message)
  });

  adb.stderr.on('data', (data) => {
    console.log(`ERROR: ${data}`);
  });

  adb.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

export {
  start,
}
