const pull = require('pull-stream')

module.exports = function (server) {
  if (!server) throw new Error('day-posts helper requires a server!')
  if (!server.query) throw new Error('day-posts helper requires a server with the ssb-query installed!')

  return function getAuthorName (feedId, cb) {
    // NOTE the data is coming in from the dayPosts source and has been mapped into the form { author, timestamp, text, root }

    // cb is a function provided to us by pull-paramap which we use to pass results out once we're done and to pass things on to the next part of the stream (the collect here)

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

        if (!results || !results.length) cb(null, feedId)
        else cb(null, results[0].name)
      })
    )
  }
}
