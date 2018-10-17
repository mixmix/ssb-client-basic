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


##  `v02` - todays post

Instead of just getting the last 100 messages then filtering them down to the `post` messages, we can get the server to do a much tighter query and to send just those results over:

```js
const opts = {
  reverse: true,
  query: [{
    $filter: {
      value: {
        content: { type: 'post' },
        timestamp: {
          $gte: 1539687600000,
          $lt: 1539774000000
        }
      }
    }
  }]
}
```

`reverse: true` means we still get these results in an order that's from the most recent to the oldest.

In ssb-query, the 'special' query-based properties are prefixed with a `$`, so `$filter` means everything inside here use that as a filter. You might notice the _shape_ of the object inside there mostly matches the shape of messages in the databse. i.e.:

```
{ 
  key: ....,
  value: {
    author: ....
    content: {
      type: 'post'
      ....
    },
    timestamp: 1539687602391 // when it was created by the author
  }
}
```
There are some other fields but we're not querying on them so I've left them off.
Notice in the `timestamp` field, that I've not given a time I've given a _time range_ : `$gte: 1539687600000` means _greater than or equal to the start of 2018-10-17 in Melbourne Australia_ (relevant because that's the start of the day _subjectivtly_ for me where I am as I write this). `$lt: 1539774000000` means _less than the start of the day following that_

The `query` property is an Array because with more advanced queries we can also get the server to map and reduce the data we've got thereby further reducing the amount of data sent over muxrpc to us. I've put a commented out example in the code you can play with.


## `v03` - who wrote these posts?

We want to put actual names to the posts we're reading. To keep things simple we're going to get the last name that the author of each post gave to themselves.

So our stream pipeline is gonna be like this :
```
  source : start streaming all the posts
    v
  through : get the asserted name
    v
  sink : collect the results and print them out
```

I've pulled the source out from v02 and put that in `herlpers/days-posts.js` so go read that to make sure you understand what sort of data is coming out of that source.

The `through` we're using needs to be asynchronous, because to get names, we're hitting the database again. We're gonna use [**pull-paramap**](https://github.com/pull-stream/pull-paramap) because it allows us to run heaps of queries to the database in parallel which is hella fast.

### The query for finding names

Like most things in the scuttleverse how one names things is something which has emerged as a convention. Here's the most common shape of the content part of a naming message : 

```js
{
  type: 'about',
  about: Target,  // the thing you're asserting something about
  name: String
}
```

And here's the full shape of our ssb-query in this case. Notice we are filtering for the about messages where the author of that message is asserting something about themselves (`value.author` and `value.content.about` are both the same).
Also notice we're performing a `$map` which means the data coming back from this query is only the actual name, and not the whole about message.

```js
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
```

Extras : all the special query things like `$is` are part of a module called `map-filter-reduce`, and are currently poorly documented. You can read the source for them fairly easily here though : https://github.com/dominictarr/map-filter-reduce/blob/master/simple/maps.js


## `v04` - push it into the DOM!

This one you run differently in the terminal: 
```
npx electro v04.js
```

This says "hey use the module electro to run this file instead of node". [**electro**](https://github.com/dominictarr/electro) is a wrapper around [electron](https://electronjs.org/) which makes is super easy to run code like this from the command line.

We're also introducing [**yo-yo**](https://www.npmjs.com/package/yo-yo) which gives you pretty simple templating which looks a lot like html.
It also doesn't do any fancy auto-updating - if you want to update something you literally call an update method and tell it what you're swapping in.


## `v05` - faces to names

not yet documented.
The blob serving may only work if you're using Patchbay (Patchwork might server blobs over different ports, haven't checked)

- adds `async/get-avatar.js` which is similar but different to `get-name`
  - uses `pull.take(1)` instead of `limit: 1` because we need to check results coming out are valid before stopping results
  - uses `ssb-ref` to validate blob links

