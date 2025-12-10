/**
 * Rate Limiting Logic Test
 * 
 * This demonstrates the correct time comparison logic:
 * - Records are created with expiresAt = now + windowMs
 * - Expired records have expiresAt < now (should be deleted)
 * - Valid records have expiresAt > now (should be counted)
 */

// Example timeline for 15-minute window:
// 
// Time:     10:00    10:05    10:10    10:15    10:20    10:25
// Action:   Create   Create   Create   Check    Check    Check
//           Record1  Record2  Record3  Limits   Limits   Limits
//
// At 10:20 (20 minutes after start):
// - Record1 expires at 10:15 (expiresAt < now) → DELETE
// - Record2 expires at 10:20 (expiresAt = now) → DELETE  
// - Record3 expires at 10:25 (expiresAt > now) → COUNT
//
// Correct logic: Only Record3 should be counted
// Incorrect logic: Would count records from 10:05 onwards (2x window)

export const RATE_LIMIT_EXAMPLE = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 3,
  keyPrefix: 'test',
};

// This would be the test implementation:
// 1. Create records at different times
// 2. Verify only non-expired records are counted
// 3. Verify expired records are cleaned up