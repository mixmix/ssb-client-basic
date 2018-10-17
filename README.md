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

