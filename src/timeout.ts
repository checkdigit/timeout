// timeout.ts

/*
 * Copyright (c) 2021-2025 Check Digit, LLC
 *
 * This code is licensed under the MIT license (see LICENSE.txt for details).
 */

import { TimeoutError } from './error.ts';
import type { TimeoutOptions } from './options.ts';

const MINIMUM_TIMEOUT = 1; // 1ms
const MAXIMUM_TIMEOUT = 900_000; // 15 minutes

const DEFAULT_OPTIONS: Required<TimeoutOptions> = {
  timeout: 60_000, // 1 minute
};

/**
 * Promise with timeout implementation.  If promise takes longer than timeout milliseconds to resolve, reject with
 * a TimeoutError.
 * @param promise
 * @param timeout
 */
export default async function <Type>(
  promise: Promise<Type>,
  { timeout = DEFAULT_OPTIONS.timeout }: TimeoutOptions = DEFAULT_OPTIONS,
): Promise<Type> {
  if (timeout < MINIMUM_TIMEOUT || timeout > MAXIMUM_TIMEOUT) {
    // Node's built-in setTimeout will default the delay to 1 ms
    // if the delay is larger than 2,147,483,647 ms or less than 1 ms.
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
