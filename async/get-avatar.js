const pull = require('pull-stream')
const { isBlob } = require('ssb-ref')

module.exports = function (server) {
  if (!server) throw new Error('day-posts helper requires a server!')
  if (!server.query) throw new Error('day-posts helper requires a server with the ssb-query installed!')

  return function getAvatar (feedId, cb) {
    // NOTE the data is coming in from the dayPosts source and has been mapped into the form { author, timestamp, text, root }

    // cb is a function provided to us by pull-paramap which we use to pass results out once we're done and to pass things on to the next part of the stream (the collect here)

    const opts = {
      reverse: true,
      query: [
        {
          $filter: {
            value: {
              author: feedId,
              content: {
                type: 'about',
                about: feedId,
                image: { $truthy: true }
              },
              timestamp: { $gt: 0 } // a hack that forces ordering by timestamp
            }
          }
        },
        {
          $map: {
            image: ['value', 'content', 'image']
          }
        }
      ]
    }

    pull(
      server.query.read(opts),
      // hooray the format for image about is non-standardised... could be image.link or image that the blob link is stored under
      pull.map(data => typeof data.image === 'string'
        ? data.image
        : data.image.link
      ),
      pull.filter(link => isBlob(link)),
      pull.take(1),
      pull.collect((err, results) => {
        if (err) {
          cb(err)
          return
        }

        if (!results || !results.length) cb(null, null)
        else cb(null, results[0])
      })
    )
  }
}
