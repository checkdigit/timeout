# `@checkdigit/timeout`

Copyright (c) 2023–2025 [Check Digit, LLC](https://checkdigit.com)

The `@checkdigit/timeout` module implements the recommended Check Digit timeout algorithm for promises.

## Installing

```shell
npm install @checkdigit/timeout
```

## Use

```ts
import timeout from '@checkdigit/timeout';

// await a promise, with the default 60 second timeout
await timeout(new Promise(....));

// await a promise, but with a 10 second timeout
await timeout(new Promise(....), { timeout: 10000 });

```

## License

MIT
