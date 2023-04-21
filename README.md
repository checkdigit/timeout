# `@checkdigit/timeout`

The `@checkdigit/timeout` module implements the recommended Check Digit timeout algorithm for promises.

### Installing

`npm install @checkdigit/timeout`

### Use

```
import timeout from '@checkdigit/timeout';

// await a promise, with the default 60 second timeout
await timeout(new Promise(....));

// await a promise, but with a 10 second timeout
await timeout(new Promise(....), { timeout: 10000 });

```

## License

MIT
