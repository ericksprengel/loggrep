#!/usr/bin/env bun
import {appendFileSync} from 'node:fs'

const args = Bun.argv.slice(2)
const mode = process.env.LOGGREP_TEST_MODE
if (process.env.LOGGREP_TEST_CALLS) appendFileSync(process.env.LOGGREP_TEST_CALLS, JSON.stringify(args) + '\n')
if (args[0] === 'shell') {
  if (mode === 'psfail') {
    console.error('device offline')
    process.exit(9)
  }
  console.log('USER PID PPID VSZ RSS WCHAN ADDR S NAME')
  console.log('u0_a1 100 1 10 10 0 0 S com.example.app')
  console.log('u0_a2 200 1 10 10 0 0 S com.example.other')
} else if (args.includes('-c')) {
  if (mode === 'resetfail') {
    console.error('reset denied')
    process.exit(8)
  }
} else if (mode === 'readfail') {
  console.error('device unauthorized')
  process.exit(7)
} else {
  if (mode === 'live') {
    const stop = () => {
      if (process.env.LOGGREP_TEST_STOPPED) Bun.write(process.env.LOGGREP_TEST_STOPPED, 'stopped').then(() => process.exit(0))
      else process.exit(0)
    }
    process.on('SIGTERM', stop)
    process.on('SIGINT', stop)
    setInterval(() => {}, 1000)
    if (process.env.LOGGREP_TEST_READY) await Bun.write(process.env.LOGGREP_TEST_READY, String(process.pid))
  }
  console.error('diagnostic from device')
  console.log('1729512000.123 100 101 E Network: live failure')
}
