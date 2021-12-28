import {spawn, spawnSync} from 'child_process'
import {createInterface} from 'readline'
import log from '../utils/log'
import {LogEntry, LogLevel} from '../types/log'
import {createReadStream} from 'fs'
import * as dayjs from 'dayjs'

// I/TAG   ( 1234): message: fruit=banana?
//const LOG_LINE_BRIEF = /^([A-Z])\/\s*(\S*)\s*\( *(\d+)\): (.*)$/

// 12-23 16:04:20.225  1207  1876 D SemContextService: lock : registerCallback
//const LOG_LINE_THREADTIME = /^\s*(\d+)\s+(\d\d:\d\d:\d\d.\d\d\d)\s+(\d+)\s+(\d+)\s+([A-Z])\s*(\S*)\s*: (.*)$/

// 1640647366.608	1207  1876 D SemContextService: lock : registerCallback
const LOG_LINE_EPOCH =  /^\s*([\d.]+)\s+(\d+)\s+(\d+)\s+([A-Z])\s*(\S*)\s*: (.*)$/

// input
const start = (callback: (logEntry: LogEntry) => void, input: string|undefined, shouldReset: boolean): void => {
  var adb = null;
  var stream: NodeJS.ReadableStream;

  if (input) {
    stream = createReadStream(input)
  } else {
    if(shouldReset){
      spawnSync("adb", ["logcat", "-c"])
    }
    adb = spawn("adb", ["logcat", "-v", "threadtime", "-v", "epoch"]);
    stream = adb.stdout
  }

  const rl = createInterface({
    input: stream,
  })

  rl.on('line', (line: string) => {
    const res = LOG_LINE_EPOCH.exec(line)
    if (!res) {
      // console.log('IGNORING: ', line)
      return
    }

    // EPOCH
    const [fullMatch, epoch, pid, tid, level, tag, message] = res

    if (line !== fullMatch) {
      // eslint-disable-next-line unicorn/no-process-exit, no-process-exit
      process.exit(1)
    }

    const date = dayjs.unix(parseFloat(epoch)).toDate()

    callback({
      line,
      level: level as LogLevel,
      epoch: date,
      tid,
      tag,
      pid,
      message,
    })
  })

  if (adb) {
    adb.stderr.on("data", (data: any): void => {
      log.e(`ERROR: ${data}`);
    });

    adb.on("close", (code: number) => {
      log.e(`child process exited with code ${code}`);
    });
  }

}

export { start }
