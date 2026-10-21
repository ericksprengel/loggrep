#!/usr/bin/env bun
import {parseArgs} from 'node:util'
import main from './core'
import type {LoggrepConfig} from './types/log'
import {version} from '../package.json'

const HELP = `Usage: loggrep [options]

Compose TypeScript/JavaScript modules over live Android logcat or a recording.

Options:
  -m, --module <path>   Module to load; repeat to combine (default: @all)
  -i, --input <path>    Read a saved logcat recording instead of adb
  -c, --config <path>   JSON configuration passed to each handler
  -R, --reset          Clear device logs before reading live logcat
  -h, --help           Show help
  -v, --version        Show version

Examples:
  loggrep -m performance_issues.ts
  loggrep -m @pidcat -m ./my-filter.js -c config.json
  loggrep -m ./scenario.ts -i recorded.log
`

async function run() {
  const {values} = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      module: {type: 'string', short: 'm', multiple: true},
      input: {type: 'string', short: 'i'},
      config: {type: 'string', short: 'c'},
      reset: {type: 'boolean', short: 'R'},
      help: {type: 'boolean', short: 'h'},
      version: {type: 'boolean', short: 'v'},
    },
    strict: true,
    allowPositionals: false,
  })
  if (values.help) {
    console.log(HELP)
    return
  }
  if (values.version) {
    console.log(version)
    return
  }
  if (values.input !== undefined && values.reset) {
    throw new Error('--reset requires live adb input; it cannot be used with --input')
  }

  let config: LoggrepConfig = {}
  if (values.config !== undefined) {
    try {
      const parsed: unknown = await Bun.file(values.config).json()
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('expected a JSON object')
      }
      config = parsed as LoggrepConfig
    } catch (cause) {
      throw new Error(`Cannot load config "${values.config}": ${errorMessage(cause)}`)
    }
  }

  const controller = new AbortController()
  const interrupt = () => {
    process.exitCode = 130
    controller.abort()
  }
  const terminate = () => {
    process.exitCode = 143
    controller.abort()
  }
  process.on('SIGINT', interrupt)
  process.on('SIGTERM', terminate)
  try {
    await main(values.module ?? ['@all'], config, values.input, values.reset ?? false, controller.signal)
  } finally {
    process.off('SIGINT', interrupt)
    process.off('SIGTERM', terminate)
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    console.error(`loggrep: ${errorMessage(error)}`)
    process.exitCode = 1
  }
}
