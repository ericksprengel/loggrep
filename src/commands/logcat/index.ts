import {Command, Flags} from '@oclif/core'
import main from '../../core'
import {readJsonFile} from '../../utils/json'

const CONFIG = {
  packages: [
    'br.com.comunicap',
    'br.com.stone.ton.development',
    'br.com.stone.ton',
  ],
}

export default class Logcat extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ loggrep logcat --f=@all`,
    `$ loggrep logcat --f=./myfilter`,
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    filters: Flags.string({
      char: 'f',
      description: 'filters',
      default: ['@all'],
      multiple: true,
    }),
    // flag with no value (-f, --force)
    config: Flags.string({
      char: 'c',
      description: 'config file',
    }),
  }

  static args = []

  async run() {
    const {args, flags} = await this.parse(Logcat)
    const {filters, config: configFile} = flags

    let config = CONFIG
    if (configFile) {
      config = readJsonFile(configFile)
    }
    // console.log({filters, config})
    this.log('config %O', JSON.stringify(config))
    this.log('filters: %s', filters.join(', '))
    await main(filters, config)
  }
}
