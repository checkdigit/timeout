// timeout.ts

/*
 * Copyright (c) 2021-2022 Check Digit, LLC
 *
 * This code is licensed under the MIT license (see LICENSE.txt for details).
 */

export interface TimeoutOptions {
  timeout?: number;
}

const MINIMUM_TIMEOUT = 1; // 1ms
const MAXIMUM_TIMEOUT = 900_000; // 15 minutes

const DEFAULT_OPTIONS: Required<TimeoutOptions> = {
  timeout: 60_000, // 1 minute
};

export class TimeoutError extends Error {
  constructor(public timeout: number) {
    super(`Timeout after ${timeout}ms`);
  }
}

/**
 * Promise with timeout implementation.  If promise takes longer than timeout milliseconds to resolve, reject with
 * a TimeoutError.
 * @param promise
 * @param timeout
 */
export default async function <Type>(
  promise: Promise<Type>,
  { timeout = DEFAULT_OPTIONS.timeout }: TimeoutOptions = DEFAULT_OPTIONS
): Promise<Type> {
  if (timeout < MINIMUM_TIMEOUT || timeout > MAXIMUM_TIMEOUT) {
    // Node's built-in setTimeout will default the delay to 1ms if the delay is larger than 2147483647ms or less than 1ms.
    // Instead, we error if the argument is invalid.
    throw new RangeError(`The timeout must be >= ${MINIMUM_TIMEOUT} and <= ${MAXIMUM_TIMEOUT}`);
  }

  let handle: number | undefined | NodeJS.Timeout;
  try {
    return (await Promise.race([
      promise,
      new Promise((_, reject) => {
        handle = setTimeout(() => {
          reject(new TimeoutError(timeout));
        }, timeout);
      }),
    ])) as Type;
  } finally {
    clearTimeout(handle);
  }
}
