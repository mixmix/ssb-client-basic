# SSB Client Basic

Let's build the most minimal client interface we can!

If you'd like to revisit the snapshot of each step you can jump to each version using git! (I've made git tags).

- `git tag --list` to see all tags
- `git checkout TAGNAME` to jump to that point in time
  - make sure you run `npm install` when you jump to make sure you have the right things installed for that particular snapshot of code

## v0 - whoami

We're not going to worry about running a 'server' locally (the backened peer/ db), we can rely on someone else to do that (just start up Patchwork or Patchbay and you're good to go!) 

Here we install [**ssb-client**](https://github.com/ssbc/ssb-client) which establishes a remote connection to the scuttlebot server being run by Patchworl/ Patchbay.

We're adding no options, which means it will load all the defaults (e.g. use the standard ports, and use the identity in `~/.ssb/secret`)

`whoami` is an asynchronous method which calls back with the details of the feed your scuttlebot is currently running. It's the basic "hello world" of scuttlebutt.

We close the connection to the server using `server.close()` otherwise the connection stays open forever!

Running this code can be done from the terminal with the command:
- `node index.js`
- `npm start` or `npm run start` (which runs the command in the 'start' script in our package.json)

