import { describe, it, expect } from 'vitest';
import { config } from './config';

describe('config', () => {
  it('should have apiBaseUrl defined', () => {
    expect(config.apiBaseUrl).toBeDefined();
    expect(typeof config.apiBaseUrl).toBe('string');
  });

  it('should have googleMapsApiKey defined', () => {
    expect(config.googleMapsApiKey).toBeDefined();
    expect(typeof config.googleMapsApiKey).toBe('string');
  });
});
