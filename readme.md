Site in development at [knode.io](http://knode.io)

# meetups

A repository of Node meetups. A template is
provided to add your own: simply copy the `template/` directory
to `city-state-country/`, and rename the file to `your-meetup-name.md`,
and send a pull request.

## audience

This repository is intended primarily for node meetup organizers or 
individuals looking to organize a local node meetup -- the intent is
to share meeting formats, lists of talks, other resources. For a list
of node events, see [node-meatspace](https://github.com/mikeal/node-meatspace).

### api

To use this repository as a package, it's best to add it as a git url to your
package.json:

```json
  "dependencies": {
    "knode-meetups": "git://github.com/knode/meetups.git#master"
  }
```

This ensures you'll be working with the latest set of meetup information. To
use this information in your code:

```javascript
var meetups = require('knode-meetups')
  , concat = require('concat-stream')

meetups().pipe(concat(function(data) {
  // data is an array of `meetup` POJSO's.
}))
```

#### meetups() -> Readable (flowing) Stream

Calling `meetups()` will return a readable stream of `meetup` objects.

#### meetup object

Meetup objects take the following form:

```javascript
{ "name": "name of meetup"
, "location": "Lawrence, KS"
, "github": "github.com/url"
, "urls": ["url1", "url2"]
, "organizers": ["organizer1", "organizer2"]
, "formats": [{name: "Talk Night", info: [/* marked-lexed input */]}]
, "process": "process description" 
, "irc": "irc"
, "coords": {"lat": Number, "lon": Number}
, "code-of-conduct": "Yes / No / N/A" }
```

## license

All code is licensed MIT.
