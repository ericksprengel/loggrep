const fs = require('fs')

const readJsonFile = <T>(path: string): T => JSON.parse(
  fs.readFileSync(path, 'utf8')
)

export {
  readJsonFile,
}
