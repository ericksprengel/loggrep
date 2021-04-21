import {LoggrepHandler} from '../types/log'

export const handler: LoggrepHandler = async () => {
  const filters = [
    {tag: /^BANANA$/},
    {message: /BANANA/},
    {message: /banana/},
  ]

  return {
    filters,
  }
}
