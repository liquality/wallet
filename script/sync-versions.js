const fs = require('fs')
const path = require('path')
const { version } = require('../package.json')

console.log(`Syncing version to ${version}`)

;[
  path.join(__dirname, '..', 'package-lock.json'),
  path.join(__dirname, '..', 'src', 'manifest.json')
].map(filePath => {
  const json = require(filePath)

  json.version = version

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n')
})
