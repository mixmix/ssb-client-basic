const Connection = require('ssb-client')
const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')
const html = require('yo-yo')
const daysPosts = require('./source/days-posts')
const getName = require('./async/get-name')

const App = html`
  <div style="margin: 2rem;">Loading...</div>
`
document.body.appendChild(App)

Connection((err, server) => {
  if (err) throw err

  const today = new Date(2018, 9, 17)

  pull(
    daysPosts(server)(today),
    pull.paraMap(addName, 50), // run up to 50 asyncrhonous maps in parallel
    pull.collect(onDone)
  )

  function addName (data, cb) {
    // getName is a much less opinionated method which just takes a feedId and asynchronously calls back with a name
    // addName is then a function which knows about the shape of the data coming through the stream and how to handle the results
    getName(server)(data.author, (err, name) => {
      if (err) cb(err)
      else {
        data.authorName = name
        cb(null, data)
      }
    })
  }

  function onDone (err, data) {
    if (err) {
      console.error('oh noes', err)
      server.close()
      return
    }

    const newView = Messages(data)
    html.update(App, newView)

    console.log(`${data.length} messages`)
    console.timeEnd('get posts')
    server.close()
  }
})

function Messages (data) {
  return html`
    <div style="font-family: arial;">
      ${data.map(Message)}
    </div>
  `
}

function Message (msgData) {
  const { authorName, timestamp, text, root } = msgData
  // this is called 'destructuring' and is equivalent to `const authorName = msgData.authorName` etc

  const thread = root
    ? html`
      <p style="font-size: .8rem; margin: 0">thread: ${root}</p>
    `
    : null

  return html`
    <div style="margin: 2rem;">
      <strong>${authorName}</strong> - ${new Date(timestamp).toLocaleString()}
      ${thread}
      <p>${text}</p>
    </div>
  `
}
