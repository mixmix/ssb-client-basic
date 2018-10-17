// Note this is just extracted from v02.js and gussied up a little to make is more useable and to make v03.js less cluttered

module.exports = function (server) {
  if (!server) throw new Error('day-posts helper requires a server!')
  if (!server.query) throw new Error('day-posts helper requires a server with the ssb-query installed!')

  return function daysPosts (day = new Date()) {
    const opts = {
      reverse: true,
      query: [
        {
          $filter: {
            value: {
              content: { type: 'post' },
              timestamp: {
                $gte: Number(startOfDay(day)),
                $lt: Number(startOfDay(day, +1))
              }
            }
          }
        }, {
          $map: {
            author: ['value', 'author'],
            timestamp: ['value', 'timestamp'],
            text: ['value', 'content', 'text'],
            root: ['value', 'content', 'root'] // the root messages of a thread, this is present if this post is a reply to another message
          }
        }
      ]
    }

    return server.query.read(opts)
    // returns a source stream
    // will not start delivering data until it's connected with a sink
  }
}

function startOfDay (time = new Date(), dayOffset = 0) {
  // dayOffset = 0 means if this argument is not supplied to set it to default to 0

  const year = time.getFullYear()
  const month = time.getMonth()
  const date = time.getDate() + dayOffset
  return new Date(year, month, date, 0, 0, 0) // 0 hours, 0 minutes, 0 secords
}
