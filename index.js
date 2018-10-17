const Connection = require('ssb-client')

Connection((err, server) => {
  if (err) {
    throw err
  }

  server.whoami((err, keys) => {
    if (err) console.log('could not get keys, got err', err)
    else console.log(keys)

    server.close()
    // close the connection to the server (not the server itself!)
  }
})

