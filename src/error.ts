// error.ts

/*
 * Copyright (c) 2021-2023 Check Digit, LLC
 *
 * This code is licensed under the MIT license (see LICENSE.txt for details).
 */

export class TimeoutError extends Error {
  constructor(public timeout: number) {
    super(`Timeout after ${timeout}ms`);
  }
}
