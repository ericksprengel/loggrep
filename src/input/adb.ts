import {spawn} from 'child_process'
import * as readline from 'readline'
import log from '../utils/log'
import {LogEntry, LogLevel} from '../types/log'

// I/TAG   ( 1234): message: fruit=banana?
const LOG_LINE  = /^([A-Z])\/\s*(\S*)\s*\( *(\d+)\): (.*)$/

// input
const start = (
  callback: (logEntry: LogEntry) => void,
): void => {
  const adb = spawn('adb', ['logcat', '-v', 'brief'])

  const rl = readline.createInterface({
    input: adb.stdout,
  })

  rl.on('line', (line: string) => {
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
      // eslint-disable-next-line unicorn/no-process-exit, no-process-exit
      process.exit(1)
    }
    callback({
      line,
      level: level as LogLevel,
      tag,
      pid,
      message,
    })
  })

  adb.stderr.on('data', (data: any): void => {
    log.e(`ERROR: ${data}`)
  })

  adb.on('close', (code: number) => {
    log.e(`child process exited with code ${code}`)
  })
}

export {
  start,
}
