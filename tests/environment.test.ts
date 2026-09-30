import { describe, expect, it } from 'vitest';
import { ApplicationError } from '../src/errors/application.error.js';

describe('ApplicationError', () => {
  it('keeps technical and user-facing messages separate', () => {
    const error = new ApplicationError('Technical message', 'Public message');

    expect(error.message).toBe('Technical message');
    expect(error.userMessage).toBe('Public message');
    expect(error.name).toBe('ApplicationError');
  });
});
