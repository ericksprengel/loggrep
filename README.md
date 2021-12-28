loggrep
=======

Loggrep is a awesome tool to analyze/view logcat (Android logs with custom filters and views

It's totally inspired on [pidcat from Jake Wharton](https://github.com/JakeWharton/pidcat)


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/loggrep.svg)](https://npmjs.org/package/loggrep)
[![Downloads/week](https://img.shields.io/npm/dw/loggrep.svg)](https://npmjs.org/package/loggrep)
[![License](https://img.shields.io/npm/l/loggrep.svg)](https://github.com/ericksprengel/loggrep/blob/master/package.json)

# Getting Started

Show all logcat log entries
```shell
npx loggrep logcat -f=@all
```

Available filters:
 - [@all](https://github.com/ericksprengel/loggrep/blob/master/src/filters/all.ts)
 - [@none](https://github.com/ericksprengel/loggrep/blob/master/src/filters/none.ts)
 - [@pidcat](https://github.com/ericksprengel/loggrep/blob/master/src/filters/pidcat.ts)
 - [@banana](https://github.com/ericksprengel/loggrep/blob/master/src/filters/banana.ts)


### My custom filter

```shell
npx loggrep logcat -f=./banana.js
```

`./banana.js` :
```javascript
const handler = async () => {
  const filters = [
    // filter "ActivityManager" tag
    {tag: /^ActivityManager$/},
  ]

  return {
    filters,
  }
}

exports.handler = handler
```

More examples like `./banana.js`:
```javascript
const handler = async () => {
  const filters = [
    // filter "Zygote" tag
    {tag: /^Zygote$/},

    // filter "Error" level
    {level: /^E$/},

    // filter process with pid "1234"
    {pid: /^1234$/},

    // filter log entries with tag "ActivityManager" and messages starting with "Received BROADCAST intent"
    {
      tag: /^ActivityManager$/,
      message: /^Received BROADCAST intent/
    },

    // custom function
    // return true to show a log entry
    ({
      tag, line, level, tag, pid, message
    }) => tag.endsWith('Manager'),
  ]

  return {
    filters,
  }
}

exports.handler = handler
```

# Why loggrep?

Filter adb logcat output is a painful task.
If you'd like to filter by tag, message, log level or pid; you probably already used a combination of grep commands.
But if you are debugging Android OS (framework, applications, radio etc.) in debug mode, you know that it's impossible to handle it.

`loggrep` is a tool with powerful and customizable filters/formatters that will help you.


P.S.: if you're trying to filter only your application log, you just need [Jake Wharton's pidcat](https://github.com/JakeWharton/pidcat)



<!-- toc -->
* [Getting Started](#getting-started)
* [Why loggrep?](#why-loggrep)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g loggrep
$ loggrep COMMAND
running command...
$ loggrep (--version)
loggrep/2.0.2 darwin-x64 node-v16.13.1
$ loggrep --help [COMMAND]
USAGE
  $ loggrep COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`loggrep help [COMMAND]`](#loggrep-help-command)
* [`loggrep logcat`](#loggrep-logcat)
* [`loggrep plugins`](#loggrep-plugins)
* [`loggrep plugins:inspect PLUGIN...`](#loggrep-pluginsinspect-plugin)
* [`loggrep plugins:install PLUGIN...`](#loggrep-pluginsinstall-plugin)
* [`loggrep plugins:link PLUGIN`](#loggrep-pluginslink-plugin)
* [`loggrep plugins:uninstall PLUGIN...`](#loggrep-pluginsuninstall-plugin)
* [`loggrep plugins update`](#loggrep-plugins-update)

## `loggrep help [COMMAND]`

Display help for loggrep.

```
USAGE
  $ loggrep help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for loggrep.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.9/src/commands/help.ts)_

## `loggrep logcat`

describe the command here

```
USAGE
  $ loggrep logcat [-h] [-f <value>] [-c <value>]

FLAGS
  -c, --config=<value>      config file
  -f, --filters=<value>...  [default: @all] filters
  -h, --help                Show CLI help.

DESCRIPTION
  describe the command here

EXAMPLES
  $ loggrep logcat --f=@all

  $ loggrep logcat --f=./myfilter
```

_See code: [dist/commands/logcat/index.ts](https://github.com/ericksprengel/loggrep/blob/v2.0.2/dist/commands/logcat/index.ts)_

## `loggrep plugins`

List installed plugins.

```
USAGE
  $ loggrep plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ loggrep plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `loggrep plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ loggrep plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ loggrep plugins:inspect myplugin
```

## `loggrep plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ loggrep plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ loggrep plugins add

EXAMPLES
  $ loggrep plugins:install myplugin 

  $ loggrep plugins:install https://github.com/someuser/someplugin

  $ loggrep plugins:install someuser/someplugin
```

## `loggrep plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ loggrep plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ loggrep plugins:link myplugin
```

## `loggrep plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ loggrep plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ loggrep plugins unlink
  $ loggrep plugins remove
```

## `loggrep plugins update`

Update installed plugins.

```
USAGE
  $ loggrep plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
