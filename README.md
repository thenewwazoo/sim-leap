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

Certificate auth
---

The LEAP client uses certificate auth to connect to LEAP devices, but it doesn't actually do server validation. This simulated server, on the other hand, speaks SSL but doesn't do client auth. Basically, both sides have to have a certificate and key, but neither one checks the other side. To generate a keypair and self-signed certificate that your client and server can use, run the following:

```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
```

in the checked-out directory.
