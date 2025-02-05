// error.ts

/*
 * Copyright (c) 2021-2025 Check Digit, LLC
 *
 * This code is licensed under the MIT license (see LICENSE.txt for details).
 */

export class TimeoutError extends Error {
  public timeout: number;
  constructor(timeout: number) {
    super(`Timeout after ${timeout}ms`);
    this.timeout = timeout;
  }
}
