const Connection = require('ssb-client')
const pull = require('pull-stream')

console.log('Connecting')

Connection((err, server) => {
  if (err) throw err
  console.log('Connection established')

  const today = new Date()
  const opts = {
    reverse: true,
    query: [
      {
        $filter: {
          value: {
            content: { type: 'post' },
            timestamp: {
              $gte: Number(startOfDay(today)),
              $lt: Number(startOfDay(today, +1))
            }
          }
        }
      },
      {
        $map: {
          author: ['value', 'author'],
          timestamp: ['value', 'timestamp'],
          text: ['value', 'content', 'text'],
          root: ['value', 'content', 'root'] // the root messages of a thread, this is present if this post is a reply to another message
        }
      }
    ]
  }

  pull(
    server.query.read(opts),
    pull.collect(onDone)
  )

  function onDone (err, msgs) {
    if (err) {
      console.error('oh noes', err)
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

// helpers

function startOfDay (time = new Date(), dayOffset = 0) {
  // dayOffset = 0 means if this argument is not supplied to set it to default to 0

  const year = time.getFullYear()
  const month = time.getMonth()
  const date = time.getDate() + dayOffset
  return new Date(year, month, date, 0, 0, 0) // 0 hours, 0 minutes, 0 secords
}

function prettyPrint (obj) {
  console.log(JSON.stringify(obj, null, 2))
  // this just print the full object out as a string that's been nicely indented
  // with each level of nesting
}
