/**
 * Timer utilities for auction countdown management.
 */

export const INITIAL_TIMER_SECONDS = 30;
export const BID_EXTENSION_SECONDS = 10;

/**
 * Get Unix timestamp (ms) when the timer should end.
 */
export function getTimerEndTimestamp(seconds = INITIAL_TIMER_SECONDS) {
  return Date.now() + seconds * 1000;
}

/**
 * Calculate seconds remaining from a Unix end timestamp.
 * Returns 0 if already expired.
 */
export function getSecondsRemaining(timerEndTimestamp) {
  const remaining = Math.ceil((timerEndTimestamp - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Check if the timer has expired.
 */
export function isTimerExpired(timerEndTimestamp) {
  return Date.now() >= timerEndTimestamp;
}
