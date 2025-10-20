/**
 * Parse a Brisbane datetime string and convert to a Date object
 * Brisbane is AEST (UTC+10) all year (no DST)
 *
 * @param {string} datetimeStr - Date string in format YYYY_MM_DD_HH (Brisbane time)
 * @returns {Date|null} Date object representing that Brisbane time
 */
function parseBrisbaneDateTime(datetimeStr) {
	if (!datetimeStr) return null;

	const parts = datetimeStr.split('_');
	if (parts.length !== 4) return null;

	const [year, month, day, hour] = parts.map(Number);

	// Create date in Brisbane timezone (UTC+10)
	// We create it as a string with timezone offset
	const brisbaneISOString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00+10:00`;

	return new Date(brisbaneISOString);
}

/**
 * Convert a Brisbane datetime string to Melbourne time and format it
 * Brisbane is AEST (UTC+10) all year (no DST)
 * Melbourne is AEST (UTC+10) in winter, AEDT (UTC+11) in summer
 *
 * @param {string} datetimeStr - Date string in format YYYY_MM_DD_HH (Brisbane time)
 * @returns {string} Formatted datetime string in Melbourne time
 */
export function formatMelbourneDateTime(datetimeStr) {
	const parsed = parseBrisbaneDateTime(datetimeStr);
	if (!parsed) return '';

	// Format using Melbourne timezone
	const formatter = new Intl.DateTimeFormat('en-AU', {
		timeZone: 'Australia/Melbourne',
		hour: 'numeric',
		hour12: true,
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});

	return formatter.format(parsed).toLowerCase();
}

/**
 * Format just the time portion in Melbourne timezone
 * @param {string} datetimeStr - Date string in format YYYY_MM_DD_HH (Brisbane time)
 * @returns {string} Formatted time string in Melbourne time
 */
export function formatMelbourneTime(datetimeStr) {
	const parsed = parseBrisbaneDateTime(datetimeStr);
	if (!parsed) return '';

	const formatter = new Intl.DateTimeFormat('en-AU', {
		timeZone: 'Australia/Melbourne',
		hour: 'numeric',
		hour12: true
	});

	return formatter.format(parsed).toLowerCase();
}

/**
 * Format just the date portion in Melbourne timezone
 * @param {string} datetimeStr - Date string in format YYYY_MM_DD_HH (Brisbane time)
 * @returns {string} Formatted date string
 */
export function formatMelbourneDate(datetimeStr) {
	const parsed = parseBrisbaneDateTime(datetimeStr);
	if (!parsed) return '';

	const formatter = new Intl.DateTimeFormat('en-AU', {
		timeZone: 'Australia/Melbourne',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});

	return formatter.format(parsed);
}
