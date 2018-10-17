const Connection = require('ssb-client')
const pull = require('pull-stream')

console.log('Connecting')

Connection((err, server) => {
  if (err) throw err
  console.log('Connection established')

  const opts = {
    limit: 100,
    reverse: true
  }

  pull(
    server.query.read(opts),
    pull.filter(msg => msg.value.content.type === 'post'),
    pull.collect(onDone)
  )

  function onDone (err, msgs) {
    if (err) {
      console.error(err)
      server.close()
      return
    }

    msgs.forEach(msg => {
      prettyPrint(msg)
      console.log('------')
    })

    console.log(`${msgs.length} messages`)
    server.close()
  }
})

function prettyPrint (msg) {
  console.log(JSON.stringify(msg, null, 2))
  // this just print the full object out as a string that's been nicely indented
  // with each level of nesting
}
