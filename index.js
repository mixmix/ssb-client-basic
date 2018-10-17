const Connection = require('ssb-client')

console.log('Connecting')

Connection((err, server) => {
  if (err) {
    throw err
  }
  console.log('Connection established')

  server.whoami((err, keys) => {
    if (err) console.log('could not get keys, got err', err)
    else console.log('whoami details:', keys)

    console.log('disconnecting from server')
    server.close()
  })
})
