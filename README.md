# nwc24js

This node module contains utilities to interact with WiiConnect24 Wii numbers

## Installation

Install the module with the `npm install` command

```sh
npm install nwc24js
```

## Usage

### Unscramble a Wii Number

```javascript
var nwc24 = require('nwc24js')

const number = BigInt(1234567891234567)
console.log(unscrambleId(number))
```

### Load a Wii Number

```javascript
var nwc24 = require('nwc24js')

const number = BigInt(1234567891234567)
console.log(loadWiiNumber(number)
```

### Check if a Wii Number is valid

```javascript
var nwc24 = require('nwc24js')

const number = "1234-5678-9123-4567"
const isTrue = isValidWiiNumber(number)
```

`unscrambleId` and `loadWiiNumber` requires a `BigInt` argument, while the `isValidWiiNumber` function requires a formatted string like this `0000-0000-0000-0000`.

## Credits

Thanks to [Sketch](https://github.com/noahpistilli) for his work on the [nwc24](https://github.com/WiiLink24/nwc24) Go package
