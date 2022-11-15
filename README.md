A fake Lutron LEAP server
===

This is a simulation of a Lutron LEAP server, such as a SmartBridge 2 or a RadioRA3 processor. It is built upon the [lutron-leap](https://github.com/thenewwazoo/lutron-leap-js) library.

Currently-supported operations
---

* Ping response

... that's it.


How to use it
---

```
git clone https://github.com/thenewwazoo/sim-leap.git
cd sim-leap
npm run run
```

Supported commands are:
* `^C`: close the server and quit
* `k`: kill the listener (i.e. take the server offline)
* `s`: start the listener (i.e. bring the server online)
