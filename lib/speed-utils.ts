/**
 * Utility functions for speed conversion and display
 */

/**
 * Convert speed integer (0-100) to display string
 * @param speed - Speed value from 0-100
 * @param language - Language for localization ('zh' or 'en')
 * @returns Formatted speed string
 */
export function formatSpeedDisplay(speed: number | undefined, language: 'zh' | 'en' = 'en'): string {
  if (speed === undefined || speed === null) {
    return language === 'zh' ? '正常' : 'Normal';
  }

  // Convert speed integer to descriptive text
  if (speed <= 20) return language === 'zh' ? '很慢' : 'Very Slow';
  if (speed <= 30) return language === 'zh' ? '慢' : 'Slow';
  if (speed <= 40) return language === 'zh' ? '较慢' : 'Slower';
  if (speed <= 50) return language === 'zh' ? '正常' : 'Normal';
  if (speed <= 60) return language === 'zh' ? '较快' : 'Faster';
  if (speed <= 70) return language === 'zh' ? '快' : 'Fast';
  return language === 'zh' ? '很快' : 'Very Fast';
}

/**
 * Convert speed integer (0-100) to display string with value
 * @param speed - Speed value from 0-100
 * @param language - Language for localization ('zh' or 'en')
 * @returns Formatted speed string with value in parentheses
 */
export function formatSpeedDisplayWithValue(speed: number | undefined, language: 'zh' | 'en' = 'en'): string {
  if (speed === undefined || speed === null) {
    return language === 'zh' ? '正常 (50)' : 'Normal (50)';
  }

  const speedText = formatSpeedDisplay(speed, language);
  return `${speedText} (${speed})`;
}

/**
 * Convert speed integer to multiplier display (e.g., "1.2x")
 * This is INCORRECT usage - speed is not a playback multiplier
 * @deprecated Use formatSpeedDisplay instead
 */
export function formatSpeedAsMultiplier(speed: number | undefined): string {
  console.warn('formatSpeedAsMultiplier is deprecated. Speed is not a playback multiplier. Use formatSpeedDisplay instead.');
  
  if (speed === undefined || speed === null) {
    return '1.0x';
  }
  
  // This is wrong but kept for backward compatibility
  const multiplier = speed / 50; // 50 = normal = 1.0x
  return `${multiplier.toFixed(1)}x`;
}

/**
 * Get speed options for dropdowns
 * @param language - Language for localization ('zh' or 'en')
 * @returns Array of speed options with value and label
 */
export function getSpeedOptions(language: 'zh' | 'en' = 'en') {
  const speeds = [20, 30, 40, 50, 60, 70, 80];
  
  return speeds.map(speed => ({
    value: speed,
    label: formatSpeedDisplayWithValue(speed, language)
  }));
}
