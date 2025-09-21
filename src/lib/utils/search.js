// Levenshtein distance calculation for similarity scoring
function levenshteinDistance(str1, str2) {
	const matrix = [];

	for (let i = 0; i <= str2.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= str1.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= str2.length; i++) {
		for (let j = 1; j <= str1.length; j++) {
			if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j] + 1
				);
			}
		}
	}

	return matrix[str2.length][str1.length];
}

// Calculate similarity score between 0 and 1
function getSimilarity(str1, str2) {
	const maxLength = Math.max(str1.length, str2.length);
	if (maxLength === 0) return 1;

	const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
	return 1 - distance / maxLength;
}

// Search function with similarity threshold
export function fuzzySearch(items, searchTerm, threshold = 0.5, searchFields = []) {
	if (!searchTerm.trim()) return items;

	const normalizedSearchTerm = searchTerm.toLowerCase().trim();

	return items.filter(item => {
		// If no specific fields provided, search all string properties
		const fieldsToSearch = searchFields.length > 0
			? searchFields
			: Object.keys(item).filter(key => typeof item[key] === 'string');

		return fieldsToSearch.some(field => {
			const fieldValue = item[field];
			if (typeof fieldValue !== 'string') return false;

			const normalizedFieldValue = fieldValue.toLowerCase();

			// Direct substring match gets high score
			if (normalizedFieldValue.includes(normalizedSearchTerm)) {
				return true;
			}

			// Check similarity score
			const similarity = getSimilarity(normalizedSearchTerm, normalizedFieldValue);
			return similarity >= threshold;
		});
	});
}