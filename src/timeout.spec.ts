// timeout.spec.ts

/*
 * Copyright (c) 2021-2023 Check Digit, LLC
 *
 * This code is licensed under the MIT license (see LICENSE.txt for details).
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import timeout, { TimeoutError } from './index.ts';

describe('timeout', () => {
  it('returns resolved value if promise execution is less than timeout', async () => {
    assert.equal(
      await timeout(
        new Promise((resolve) => {
          setTimeout(() => resolve('abc'), 1);
        }),
        { timeout: 5 },
      ),
      'abc',
    );
  });

  it('returns with reject error if promise execution is less than timeout', async () => {
    await assert.rejects(async () => timeout(Promise.reject(new Error('Rejected')), { timeout: 5 }), {
      message: 'Rejected',
    });
  });

  it('returns resolved value if promise execution resolves immediately', async () => {
    assert.equal(await timeout(Promise.resolve('abc'), { timeout: 5 }), 'abc');
  });

  it('rejects with TimeoutError if promise execution exceeds timeout', async () => {
    let reached = false;
    await assert.rejects(
      async () =>
        timeout(
          new Promise(() => {
            // eslint-disable-next-line sonarjs/no-nested-functions
            setTimeout(() => (reached = true), 10);
          }),
          { timeout: 2 },
        ),
      { message: 'Timeout after 2ms' },
    );
    assert.equal(reached, false);

    let reachedError = false;
    let returnedError;
    try {
      await timeout(
        new Promise(() => {
          setTimeout(() => (reachedError = true), 10);
        }),
        { timeout: 3 },
      );
    } catch (error: unknown) {
      returnedError = error;
    }
    assert.equal(reachedError, false);
    assert.ok(returnedError instanceof TimeoutError);
    assert.equal(returnedError.timeout, 3);
  });

  it('throws RangeError on invalid timeout values', async () => {
    const expectedRangeError = { name: 'RangeError', message: 'The timeout must be >= 1 and <= 900000' };
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
            // eslint-disable-next-line sonarjs/no-nested-functions
            setImmediate(() => resolve(index));
          }),
        ),
      ),
    );
    // eslint-disable-next-line sonarjs/no-alphabetical-sort
    assert.deepEqual(results.sort(), range);
  });
});
