#!/usr/bin/env node --experimental-modules
import commander from 'commander'
import main from './src/core/index.mjs'

const CONFIG = {
  packages: [
    'br.com.comunicap',
  ],
}

const program = commander.program

program
  .command('logcat <filters...>')
  .description('realtime logcat filter')
  .option("-c, --config <config>", "config file")
  .action(function(filters, options){
    console.log(filters, options.config || CONFIG)
    main(filters, options.config || CONFIG)
  });

program.parse(process.argv);
