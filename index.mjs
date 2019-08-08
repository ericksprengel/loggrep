import { start } from './src/input/adb.mjs'

start((line, level, tag, pid, message) => {
  console.log(level, tag, pid, message)
  console.log('______')
})
