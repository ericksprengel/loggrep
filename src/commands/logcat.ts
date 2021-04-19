import {Command, flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {readJsonFile} from '../utils/json'

const CONFIG = {
  packages: [
    'br.com.comunicap',
    'br.com.stone.ton.development',
    'br.com.stone.ton',
  ],
}

export default class Logcat extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    filters: flags.string({
      char: 'f',
      description: 'filters',
      default: ['@all'],
      multiple: true,
    }),
    // flag with no value (-f, --force)
    config: flags.string({
      char: 'c',
      description: 'config file',
    }),
  }

  static args: Parser.args.Input = []

  async run() {
    const {flags} = this.parse(Logcat)
    const {filters, config: configFile} = flags

    let config = CONFIG
    if (configFile) {
      config = readJsonFile(configFile)
    }
    // console.log({filters, config})
    this.log('config %O', JSON.stringify(config))
    this.log('filters: %s', filters.join(', '))
  }
}
