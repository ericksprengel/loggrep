import {LoggrepHandler} from '../types/log'

export const handler: LoggrepHandler = async () => {
  const filters = [
    () => true,
  ]

  return {
    filters,
  }
}
