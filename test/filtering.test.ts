import {describe, expect, test} from 'bun:test'
import shouldShow from '../src/core/shouldShowLogEntry'
import {parseLogEntry} from '../src/input/adb'
import {readLines} from '../src/input/lines'
import type {LogEntry, LoggrepHandlerInstance} from '../src/types/log'

const entry: LogEntry = {
  line: '1729512000.123 100 101 E Network: request failed',
  epoch: new Date(1729512000123), tid: '101', level: 'E', tag: 'Network', pid: '100', message: 'request failed',
}

describe('logcat parsing', () => {
  test('retains raw text, timestamp and all fields', () => {
    expect(parseLogEntry(entry.line)).toEqual(entry)
    expect(parseLogEntry(' 1729512000.123  100  101 E Network : request failed')?.message).toBe('request failed')
    expect(parseLogEntry('1729512000.123 100 101 D App: ')?.message).toBe('')
  })
  test('ignores banners, malformed lines and unknown levels', () => {
    for (const line of ['--------- beginning of main', 'invalid', '1729512000.0 1 2 X App: bad']) {
      expect(parseLogEntry(line)).toBeUndefined()
    }
  })
})

describe('filter composition', () => {
  test('AND between fields, OR between filters and modules', () => {
    expect(shouldShow([{filters: [{tag: /^Network$/, level: /^D$/}]}], entry)).toBe(false)
    expect(shouldShow([{filters: [{tag: /^Network$/, level: /^E$/}]}], entry)).toBe(true)
    expect(shouldShow([{filters: [{tag: /^Other$/}, {level: /^E$/}]}], entry)).toBe(true)
    expect(shouldShow([{filters: []}, {filters: [{tag: /^Network$/}]}], entry)).toBe(true)
  })
  test('passes the complete entry to predicates', () => {
    expect(shouldShow([{filters: [value => value.tid === '101' && value.epoch?.getTime() === 1729512000123]}], entry)).toBe(true)
  })
  test('supports hook-only modules and empty filters', () => {
    const modules: LoggrepHandlerInstance[] = [{hooks: {onNewLine: () => {}}}, {filters: []}]
    expect(shouldShow(modules, entry)).toBe(false)
    expect(shouldShow([{filters: [{}]}], entry)).toBe(true)
    expect(shouldShow([{filters: [{message: /^$/}]}], {...entry, message: undefined})).toBe(true)
  })
  test('global and sticky regexes match successive entries deterministically', () => {
    for (const regex of [/request/g, /request/y]) {
      regex.lastIndex = 4
      const modules = [{filters: [{message: regex}]}]
      expect(shouldShow(modules, entry)).toBe(true)
      expect(shouldShow(modules, entry)).toBe(true)
      expect(regex.lastIndex).toBe(0)
    }
  })
})

test('streaming preserves split UTF-8, CRLF and a final unterminated line', async () => {
  const bytes = new TextEncoder().encode('first\r\ncafé\nlast')
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const byte of bytes) controller.enqueue(Uint8Array.of(byte))
      controller.close()
    },
  })
  const lines = []
  for await (const line of readLines(stream)) lines.push(line)
  expect(lines).toEqual(['first', 'café', 'last'])
})

test('abort cancels a reader waiting for input', async () => {
  let cancelled = false
  const controller = new AbortController()
  const stream = new ReadableStream<Uint8Array>({cancel() { cancelled = true }})
  const consume = (async () => {
    for await (const _ of readLines(stream, controller.signal)) throw new Error('unexpected line')
  })()
  controller.abort()
  await consume
  expect(cancelled).toBe(true)
})
