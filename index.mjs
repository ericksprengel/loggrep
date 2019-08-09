#!/usr/bin/env node --experimental-modules
import ansiStyles from 'ansi-styles'
import chalk from 'chalk'
import { start } from './src/input/adb.mjs'

const log = console.log

const COLORS = [
  // 'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
]

const LEVEL_COLOR = {
  V: 'white.bgBlackBright',
  D: 'black.bgBlue',
  I: 'black.bgGreen',
  W: 'black.bgYellow',
  E: 'black.bgRed',
  F: 'black.bgRed',
}

const HEADER_WIDTH = 25 + 1 + 3 + 1
const HEADER_EMPTY = ' '.repeat(HEADER_WIDTH)
const MESSAGE_LINE_WIDTH = process.stdout.columns - HEADER_WIDTH
const MESSAGE_LINE_SPLITER = new RegExp(`.{1,${MESSAGE_LINE_WIDTH}}`, 'g')

let LAST_TAG = null
let LAST_TAG_COLOR_INDEX = 0
const TAG_COLORS = {
  'AlarmManager': 'red',
  'ReactNativeJS': 'white.bgBlackBright',
}

const loadFilters = (filterPaths) => 
  Promise.all(filterPaths.map((filterPath) => {
    return import(`./src/filters/${filterPath}`)
  }))

const shouldShowIt = (filterModules, line, level, tag, pid, message) => {
  for (const filterModule of filterModules) {
    for (const filter of filterModule.filters) {
      if (filter instanceof Function) {
        return filter(line, level, tag, pid, message)
      }
      if ((!filter.line || filter.line.test(line))
        && (!filter.level || filter.level.test(level))
        && (!filter.tag || filter.tag.test(tag))
        && (!filter.pid || filter.pid.test(pid))
        && (!filter.message || filter.message.test(message))) {
        return true
      }
    }
  }
  return false
}

const main = async () => {
  let FILTER_MODULES
  try {
    FILTER_MODULES = await loadFilters([
      'pidcat',
      'sprengel',
    ])
  } catch (error) {
    log('Failed to load filters')
    log(`error message (${error.name}): ${error.message}`)
    if (error instanceof SyntaxError) {
      log('linha:', error.lineNumber)
    }
    process.exit(1)
  }

  start((line, level, tag, pid, message) => {
    if (!shouldShowIt(FILTER_MODULES, line, level, tag, pid, message)) {
      return
    }

    if (!TAG_COLORS[tag]) {
      TAG_COLORS[tag] = COLORS[LAST_TAG_COLOR_INDEX]
      LAST_TAG_COLOR_INDEX = (LAST_TAG_COLOR_INDEX + 1) % COLORS.length
    }

    const tagWithPad = tag === LAST_TAG
      ? ' '.repeat(25)
      : tag.substring(0,25).padStart(25, ' ')
    const tagWithLevel = chalk`{${TAG_COLORS[tag]} ${tagWithPad}} {${LEVEL_COLOR[level]}  ${level} }`

    const messageLines = message.match(MESSAGE_LINE_SPLITER)
    for (let i = 0; i < messageLines.length; i++) {
      if (i === 0) {
        log(`${tagWithLevel} ${messageLines[i]}`)
      } else {
        log(`${HEADER_EMPTY}${messageLines[i]}`)
      }
    }
    LAST_TAG = tag
    //log(level, tag, pid, message)
    //log('______')
  })
}

main()