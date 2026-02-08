import { validateScriptFormat, calculateSlideDuration } from '../lib/utils';

describe('Podio AI Core Logic', () => {
  test('validateScriptFormat should return true for valid scripts', () => {
    const validScript = [
      { speaker: 'Host', line: 'Hello everyone!' },
      { speaker: 'Guest', line: 'Hi there.' }
    ];
    expect(validateScriptFormat(validScript)).toBe(true);
  });

  test('validateScriptFormat should return false for invalid formats', () => {
    const invalidScript = [{ name: 'Host', text: 'Oops' }];
    expect(validateScriptFormat(invalidScript)).toBe(false);
  });

  test('calculateSlideDuration should return minimum 5 seconds', () => {
    expect(calculateSlideDuration("Short note")).toBe(5);
  });

  test('calculateSlideDuration should calculate correct timing for long notes', () => {
    // 25 words / 2.5 = 10 seconds
    const longNote = new Array(25).fill("word").join(" ");
    expect(calculateSlideDuration(longNote)).toBe(10);
  });
});
