// timeout.spec.ts

/*
 * Copyright (c) 2021-2022 Check Digit, LLC
 *
 * This code is licensed under the MIT license (see LICENSE.txt for details).
 */

import assert from 'node:assert';

import timeout, { TimeoutError } from './index';

describe('timeout', () => {
  it('returns resolved value if promise execution is less than timeout', async () => {
    assert.equal(
      await timeout(
        new Promise((resolve) => {
          setTimeout(() => resolve('abc'), 1);
        }),
        { timeout: 5 }
      ),
      'abc'
    );
  });

  it('returns with reject error if promise execution is less than timeout', async () => {
    await assert.rejects(
      async () =>
        timeout(
          new Promise((_, reject) => {
            reject(new Error('Rejected'));
          }),
          { timeout: 5 }
        ),
      /^Error: Rejected$/u
    );
  });

  it('returns resolved value if promise execution resolves immediately', async () => {
    assert.equal(
      await timeout(
        new Promise((resolve) => {
          resolve('abc');
        }),
        { timeout: 5 }
      ),
      'abc'
    );
  });

  it('rejects with TimeoutError if promise execution exceeds timeout', async () => {
    let reached = false;
    await assert.rejects(
      async () =>
        timeout(
          new Promise(() => {
            setTimeout(() => (reached = true), 10);
          }),
          { timeout: 2 }
        ),
      /^Error: Timeout after 2ms$/u
    );
    assert.equal(reached, false);

    let reachedError = false;
    let returnedError;
    try {
      await timeout(
        new Promise(() => {
          setTimeout(() => (reachedError = true), 10);
        }),
        { timeout: 3 }
      );
    } catch (error: unknown) {
      returnedError = error;
    }
    assert.equal(reachedError, false);
    assert.ok(returnedError instanceof TimeoutError);
    assert.equal(returnedError.timeout, 3);
  });

  it('throws RangeError on invalid timeout values', async () => {
    const expectedRangeError = /^RangeError: The timeout must be >= 1 and <= 900000$/u;
    await assert.rejects(() => timeout(Promise.resolve(), { timeout: -1 }), expectedRangeError);
    await assert.rejects(() => timeout(Promise.resolve(), { timeout: 0 }), expectedRangeError);
    await assert.rejects(() => timeout(Promise.resolve(), { timeout: 900_001 }), expectedRangeError);
  });

  it('does not throw RangeError on valid timeout values', async () => {
    await timeout(Promise.resolve());
    await timeout(Promise.resolve(), {});
    await timeout(Promise.resolve(), { timeout: 1 });
    await timeout(Promise.resolve(), { timeout: 900_000 });
  });

  it('works in parallel', async () => {
    const range = [...Array.from({ length: 10_000 }).keys()].map((index) => index.toString().padStart(4, '0'));
    const results = await Promise.all(
      range.map(async (index) =>
        timeout(
          new Promise((resolve) => {
            setImmediate(() => resolve(index));
          })
        )
      )
    ); // ?.
    assert.deepEqual(results.sort(), range);
  });
});
