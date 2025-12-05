/**
 * Basic test to verify Jest configuration is working
 */

describe('Test Infrastructure', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const testValue: string = 'TypeScript works';
    expect(testValue).toBe('TypeScript works');
  });
});
