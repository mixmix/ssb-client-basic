# SSB Client Basic

Let's build the most minimal client interface we can!

Get started by running `npm install`
To run a particular file run e.g. `node v00.js`

## `v00` - whoami

We're not going to worry about running a 'server' locally (the backened peer/ db), we can rely on someone else to do that (just start up Patchwork or Patchbay and you're good to go!) 

Here we install [**ssb-client**](https://github.com/ssbc/ssb-client) which establishes a remote connection to the scuttlebot server being run by Patchworl/ Patchbay.

We're adding no options, which means it will load all the defaults (e.g. use the standard ports, and use the identity in `~/.ssb/secret`)

`whoami` is an asynchronous method which calls back with the details of the feed your scuttlebot is currently running. It's the basic "hello world" of scuttlebutt.

We close the connection to the server using `server.close()` otherwise the connection stays open forever!


## `v01` - a pull-stream query!

We introduce [**pull-stream**](https://github.com/pull-stream/pull-stream), which is a really common way to handle data in scuttlebutt.
The basic idea is a every complete pull-stream connects a source of data and runs that into a sink (some output).
Along the way, your data might go _through_ some steps which filter or modify the data

Have a read of `v01.js` and see if you can guess what it does.
Run it by running `node v01.js` in the terminal and seeing what comes out.
_Kick the tyres_ by modifying the code and running it again to see what happens!

```js
pull(
  server.query.read(opts),                                // the source
  pull.filter(msg => msg.value.content.type === 'post'),  // filter 'through'
  pull.collect(onDone)                                    // the sink
)
```

The `pull` function wrapping the source, through, and sink connects these into a complete stream which data will immediately flow through.

The source is provided by [**ssb-query**](https://github.com/dominictarr/ssb-query) which is super fancy, but we'll get to that later. All you need to know now is that opts says "gimme the last 100 messages going _backwards_ from right now".

The `pull.filter` gets passed each one of the results that the source spits out, and we've set it up only to let `post` type messages continue on.

The sink is a `pull.collect`, which waits until the stream is finished (here when we've pulled 100 messages), collecting all the results then passing them as an Array to the callback `onDone`.


NOTE - you need to be using a server with the ssb-query plugin installed for this to work (most have this!)
