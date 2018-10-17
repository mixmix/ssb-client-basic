const Connection = require('ssb-client')
const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')
const daysPosts = require('./source/days-posts')

console.log('Connecting')

Connection((err, server) => {
  if (err) throw err
  console.log('Connection established')

  const today = new Date(2018, 9, 17)

  console.time('get posts')
  pull(
    daysPosts(server)(today),
    pull.paraMap(getAuthorName, 50), // run up to 50 asyncrhonous maps in parallel
    pull.collect(onDone)
  )

  // Note you could use pull.asyncMap, but it only does 1 async map at a time... it's 240x slower on my machine!

  function getAuthorName (data, cb) {
    // NOTE the data is coming in from the dayPosts source and has been mapped into the form { author, timestamp, text, root }

    // cb is a function provided to us by pull-paramap which we use to pass results out once we're done and to pass things on to the next part of the stream (the collect here)

    const feedId = data.author

    const opts = {
      limit: 1,
      reverse: true,
      query: [
        {
          $filter: {
            value: {
              author: feedId,
              content: {
                type: 'about',
                about: feedId,
                name: { $is: 'string' } // there's a name string present
              }
            },
            timestamp: { $gt: 0 } // a hack that forces ordering by timestamp
          }
        },
        {
          $map: {
            name: ['value', 'content', 'name']
          }
        }
      ]
    }

    pull(
      server.query.read(opts),
      pull.collect((err, results) => {
        if (err) {
          cb(err)
          return
        }

        var name
        if (!results || !results.length) name = feedId
        else name = results[0].name
        // console.log(name) // debug / see the names fly by as we get them!

        data.authorName = name
        // stample the name we found to the data object

        cb(null, data)
      })
    )
  }

  function onDone (err, data) {
    if (err) {
      console.error('oh noes', err)
      server.close()
      return
    }

    data.forEach(msg => {
      prettyPrint(msg)
      console.log('------')
    })

    console.log(`${data.length} messages`)
    console.timeEnd('get posts')
    server.close()
  }
})

// helpers

function prettyPrint (obj) {
  console.log(JSON.stringify(obj, null, 2))
  // this just print the full object out as a string that's been nicely indented
  // with each level of nesting
}
