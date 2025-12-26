/**
 * Date utility functions for handling UTC to IST conversions
 * Database stores all times in UTC, but we display them in IST (UTC+5:30)
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

/**
 * Convert a UTC date/string to IST Date object
 */
export function utcToIst(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return new Date(date.getTime() + IST_OFFSET_MS);
}

/**
 * Convert an IST date to UTC Date object
 */
export function istToUtc(istDate: Date): Date {
  return new Date(istDate.getTime() - IST_OFFSET_MS);
}

/**
 * Format a UTC date/string as IST time string (HH:mm format)
 */
export function formatTimeInIst(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  // Get UTC time and add IST offset manually
  const istTime = date.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istTime);
  
  // Use UTC methods to avoid local timezone interpretation
  const hours = istDate.getUTCHours().toString().padStart(2, '0');
  const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format a UTC date/string as IST time with AM/PM (hh:mm AM/PM format)
 */
export function formatTimeInIst12Hour(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const istTime = date.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istTime);
  
  let hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

/**
 * Format a UTC date/string as IST date string (DD/MM/YYYY format)
 */
export function formatDateInIst(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const istTime = date.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istTime);
  
  // Use UTC methods to avoid local timezone interpretation
  const day = istDate.getUTCDate().toString().padStart(2, '0');
  const month = (istDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = istDate.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format a UTC date/string as IST datetime string (DD/MM/YYYY HH:mm format)
 */
export function formatDateTimeInIst(utcDate: Date | string): string {
  const date = formatDateInIst(utcDate);
  const time = formatTimeInIst(utcDate);
  return `${date} ${time}`;
}

/**
 * Get start and end of today in IST, converted to UTC for API queries
 */
export function getTodayRangeInUtc(): { start: Date; end: Date } {
  const now = new Date();
  
  // Create IST midnight and end of day
  const istMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0, 0
  );
  const istEndOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59, 999
  );
  
  // Convert to UTC
  return {
    start: istToUtc(istMidnight),
    end: istToUtc(istEndOfDay)
  };
}

/**
 * Format time range in IST (e.g., "09:00 - 09:30")
 */
export function formatTimeRangeInIst(startUtc: Date | string, endUtc: Date | string): string {
  return `${formatTimeInIst(startUtc)} - ${formatTimeInIst(endUtc)}`;
}
