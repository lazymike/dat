var pump = require('pump')
var fs = require('fs')
var debug = require('debug')('bin/write')
var openDat = require('../lib/open-dat.js')
var abort = require('../lib/abort.js')
var usage = require('../lib/usage.js')('write.txt')

module.exports = {
  name: 'write',
  command: handleWrite,
  options: [
    {
      name: 'dataset',
      boolean: false,
      abbr: 'd'
    },
    {
      name: 'name',
      boolean: false,
      abbr: 'n'
    }
  ]
}

function handleWrite (args) {
  debug('handleWrite', args)

  if (args.help || args._.length === 0) {
    usage()
    abort()
  }

  openDat(args, function ready (err, db) {
    if (err) abort(err)
    handleInputStream(db)
  })

  function handleInputStream (db) {
    var path = args._[0]
    var stream = args._[1]
    var key = args.n || path

    var inputStream
    if (stream === '-') inputStream = process.stdin
    else inputStream = fs.createReadStream(path)

    // TODO: make createFileWriteStream take options
    // var opts = {
    //   dataset: args.d
    // }

    pump(inputStream, db.createFileWriteStream(key), function done (err) {
      if (err) abort(err, 'dat: err in write')
      console.error('Done writing binary data.')
    })
  }
}