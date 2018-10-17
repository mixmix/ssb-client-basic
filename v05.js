const Connection = require('ssb-client')
const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')
const html = require('yo-yo')
const daysPosts = require('./source/days-posts')
const getName = require('./async/get-name')
const getAvatar = require('./async/get-avatar')

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
    pull.paraMap(addAvatar, 50), // run up to 50 asyncrhonous maps in parallel
    pull.collect(onDone)
  )

  function addName (data, cb) {
    getName(server)(data.author, (err, name) => {
      if (err) cb(err)
      else {
        data.authorName = name
        cb(null, data)
      }
    })
  }
  function addAvatar (data, cb) {
    getAvatar(server)(data.author, (err, avatar) => {
      if (err) cb(err)
      else {
        data.avatar = avatar
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
  const { avatar, authorName, timestamp, text, root } = msgData

  return html`
    <div style="margin: 2rem;">
      ${Avatar(avatar)}
      <strong>${authorName}</strong> - ${new Date(timestamp).toLocaleString()}
      <p style="font-size: .8rem; margin: 0"> ${root ? 'thread:' : ''} ${root}</p>
      <p>${text}</p>
    </div>
  `
}

function Avatar (blobId) {
  if (!blobId) return

  const url = `http://localhost:8989/blobs/get/${blobId}`
  // this may be patchbay specific

  return html`
    <img src=${url} style="width: 2rem; height: 2rem;"/>
  `
}
