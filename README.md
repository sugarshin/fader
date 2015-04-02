# fader

[![GitHub version](https://badge.fury.io/gh/sugarshin%2Ffader.svg)](http://badge.fury.io/gh/sugarshin%2Ffader) [![License](http://img.shields.io/:license-mit-blue.svg)](http://sugarshin.mit-license.org/)

Fader

```shell
npm i sugarshin/fader
```

## Usage

```coffeescript
$ = require 'jquery'
Fader = require 'fader'

new Fader el, opts
```

or

```html
<script src="jquery.js"></script>
<script src="build/fader.js"></script>
<script>
  new Fader(el, opts);
</script>
```

## Config

default options

```javascript
var options = {
  pager: null,
  prev: null,
  next: null,
  speed: 1000,
  autoPlay: false,
  autoPlaySpeed: 3000,
  start: 0
};
```

## api

## Contributing

```shell
npm test
```

**incomplete**

## License

[MIT](http://sugarshin.mit-license.org/)

© sugarshin
