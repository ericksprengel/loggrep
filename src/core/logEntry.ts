/* eslint-disable unicorn/filename-case */
import * as chalk from 'chalk'
import log from '../utils/log'
import {LogEntry} from '../types/log'

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
const MESSAGE_LINE_WIDTH = (process.stdout.columns ?? 200) - HEADER_WIDTH
const MESSAGE_LINE_SPLITER = new RegExp(`.{1,${MESSAGE_LINE_WIDTH}}`, 'g')

let LAST_TAG: string
let LAST_TAG_COLOR_INDEX = 0
const TAG_COLORS: Record<string, string> = {
  AlarmManager: 'red',
  ReactNativeJS: 'white.bgBlackBright',
}

const logEntry = ({level, tag, message}: LogEntry) => {
  // ADD TAG TO TAGS LIST
  if (!TAG_COLORS[tag]) {
    TAG_COLORS[tag] = COLORS[LAST_TAG_COLOR_INDEX]
    LAST_TAG_COLOR_INDEX = (LAST_TAG_COLOR_INDEX + 1) % COLORS.length
  }

  // FORMAT AND LOG IT
  const tagWithPad = tag === LAST_TAG ?
    ' '.repeat(25) :
    tag.substring(0, 25).padStart(25, ' ')

  const tagWithLevel = chalk`{${TAG_COLORS[tag]} ${tagWithPad} }{${LEVEL_COLOR[level]}  ${level} }`

  if (message) {
    const messageLines = message.match(MESSAGE_LINE_SPLITER) ?? []
    for (let i = 0; i < messageLines.length; i++) {
      if (i === 0) {
        log.i(`${tagWithLevel} ${messageLines[i]}`)
      } else {
        log.i(`${HEADER_EMPTY}${messageLines[i]}`)
      }
    }
  } else {
    log.i(`${tagWithLevel} ${message}`)
  }
  LAST_TAG = tag
}

export default logEntry
