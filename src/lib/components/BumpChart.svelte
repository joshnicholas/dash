<script>
	import { formatMelbourneTime } from '$lib/utils/datetime.js';

	let { url, header, standfirst, containerWidth = 800, backgroundColor = '#ffffff', searchTerm = '' } = $props();

	let data = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let hoveredLine = $state(null);
	let showMostPersistent = $state(false);
	let isTooNarrow = $state(false);
	let localSearchTerm = $state(searchTerm);

	// Chart dimensions
	const height = 600;
	const margin = { top: 40, right: 230, bottom: 40, left: 40 };

	let width = $derived(containerWidth);
	let chartWidth = $derived(width - margin.left - margin.right);
	const chartHeight = height - margin.top - margin.bottom;

	// Transform column-oriented data to row-oriented
	function transformData(rawData) {
		if (!rawData || Object.keys(rawData).length === 0) return [];

		const keys = Object.keys(rawData);
		const numRows = Object.keys(rawData[keys[0]]).length;
		const rows = [];

		for (let i = 0; i < numRows; i++) {
			const row = {};
			for (const key of keys) {
				row[key] = rawData[key][i];
			}
			rows.push(row);
		}

		return rows;
	}

	// Process data into bump chart format
	let processedData = $derived.by(() => {
		if (!data || data.length === 0) return { lines: [], timePoints: [], currentTop10Headlines: new Set(), mostPersistentHeadlines: new Set() };

		const rows = transformData(data);

		// Get unique time points and sort
		const timePoints = [...new Set(rows.map((r) => r.scraped_datetime))].sort();

		// Get the most recent time point and find the top 10 headlines from that time
		const mostRecentTime = timePoints[timePoints.length - 1];
		const currentTop10Headlines = new Set(
			rows
				.filter(row => row.scraped_datetime === mostRecentTime && row.Rank <= 10)
				.map(row => row.Headline)
		);

		// Calculate most persistent headlines (appear in most time periods)
		const headlineFrequency = new Map();
		for (const row of rows) {
			const key = row.Headline;
			if (!headlineFrequency.has(key)) {
				headlineFrequency.set(key, new Set());
			}
			headlineFrequency.get(key).add(row.scraped_datetime);
		}

		const mostPersistentHeadlines = new Set(
			[...headlineFrequency.entries()]
				.sort((a, b) => b[1].size - a[1].size)
				.slice(0, 5)
				.map(([headline, _]) => headline)
		);

		// Group by headline
		const headlineMap = new Map();
		for (const row of rows) {
			const headline = row.Headline;
			if (!headlineMap.has(headline)) {
				headlineMap.set(headline, []);
			}
			headlineMap.get(headline).push({
				time: row.scraped_datetime,
				rank: row.Rank,
				url: row.Url
			});
		}

		// Create lines for headlines that appear in multiple time periods
		// OR are in the current top 10 (even if they only appear once)
		const lines = [];
		for (const [headline, points] of headlineMap.entries()) {
			const isCurrentTop10 = currentTop10Headlines.has(headline);
			if (points.length > 1 || isCurrentTop10) {
				// Sort points by time
				points.sort((a, b) => a.time.localeCompare(b.time));
				lines.push({
					headline,
					points,
					url: points[points.length - 1].url // Use the latest URL
				});
			}
		}

		// Sort lines by latest rank
		lines.sort((a, b) => {
			const aLastRank = a.points[a.points.length - 1].rank;
			const bLastRank = b.points[b.points.length - 1].rank;
			return aLastRank - bLastRank;
		});

		return { lines, timePoints, currentTop10Headlines, mostPersistentHeadlines };
	});

	// Filter lines based on search term
	let filteredLines = $derived.by(() => {
		if (!localSearchTerm || localSearchTerm.trim() === '') {
			return processedData.lines;
		}
		const searchLower = localSearchTerm.toLowerCase();
		return processedData.lines.filter(line =>
			line.headline.toLowerCase().includes(searchLower)
		);
	});

	// Scale functions
	function getX(timeIndex, timePoints) {
		return (timeIndex / (timePoints.length - 1)) * chartWidth;
	}

	function getY(rank) {
		return ((rank - 1) / 9) * chartHeight;
	}

	// Generate path for a line
	function generatePath(line, timePoints) {
		if (!line.points || line.points.length < 2) return '';

		const pathParts = line.points.map((point, i) => {
			const timeIndex = timePoints.indexOf(point.time);
			const x = getX(timeIndex, timePoints);
			const y = getY(point.rank);
			return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
		});

		return pathParts.join(' ');
	}

	// Determine if a line is in current top 10
	function isInCurrentTop10(line) {
		return processedData.currentTop10Headlines.has(line.headline);
	}

	// Determine if a line should be highlighted (based on mode or search)
	function isHighlighted(line) {
		// If searching, highlight all matching lines
		if (localSearchTerm && localSearchTerm.trim() !== '') {
			return filteredLines.some(l => l.headline === line.headline);
		}
		// Otherwise use mode-based highlighting
		if (showMostPersistent) {
			return processedData.mostPersistentHeadlines.has(line.headline);
		}
		return isInCurrentTop10(line);
	}

	function getColor(line) {
		// If hovering, make hovered line black, others grey
		if (hoveredLine) {
			return hoveredLine === line.headline ? '#000000' : '#999999';
		}
		// Default: highlighted lines are black, others grey
		return isHighlighted(line) ? '#000000' : '#999999';
	}

	async function fetchData() {
		try {
			loading = true;
			error = null;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			data = result;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (url) {
			fetchData();
		}
	});

	$effect(() => {
		const checkWidth = () => {
			isTooNarrow = window.innerWidth < 800;
		};

		checkWidth();
		window.addEventListener('resize', checkWidth);

		return () => window.removeEventListener('resize', checkWidth);
	});

	function isLineVisible(line) {
		if (hoveredLine) {
			return hoveredLine === line.headline;
		}
		return true;
	}

	function getLineOpacity(line) {
		if (hoveredLine) {
			return hoveredLine === line.headline ? 1 : 0.4;
		}
		// Reduce opacity for non-highlighted lines
		return isHighlighted(line) ? 0.6 : 0.3;
	}

	function shouldShowLabel(line) {
		// If hovering, only show the hovered line
		if (hoveredLine) {
			return hoveredLine === line.headline;
		}
		// Otherwise show based on current mode
		return isHighlighted(line);
	}

	function getLineWidth(line) {
		if (hoveredLine === line.headline) {
			return 3;
		}
		return 2;
	}

	// Calculate adjusted Y positions for labels to prevent overlap
	function calculateLabelPositions(lines, timePoints) {
		const minSpacing = 60;
		const labelHeight = 60;
		const positions = [];

		// Get lines that should show labels (based on highlight mode, not hover state)
		const visibleLines = lines.filter(isHighlighted);

		// Create initial positions
		visibleLines.forEach(line => {
			const lastPoint = line.points[line.points.length - 1];
			const lastY = getY(lastPoint.rank);
			positions.push({
				line,
				originalY: lastY,
				adjustedY: lastY
			});
		});

		// Sort by original Y position
		positions.sort((a, b) => a.originalY - b.originalY);

		// Distribute labels evenly across available space if they don't fit
		const totalSpaceNeeded = positions.length * minSpacing;
		const availableSpace = chartHeight - labelHeight;

		if (totalSpaceNeeded > availableSpace) {
			// Distribute evenly across available height
			const spacing = availableSpace / (positions.length - 1 || 1);
			positions.forEach((pos, i) => {
				pos.adjustedY = i * spacing;
			});
		} else {
			// Adjust positions to prevent overlap
			for (let i = 1; i < positions.length; i++) {
				const prev = positions[i - 1];
				const current = positions[i];

				if (current.adjustedY - prev.adjustedY < minSpacing) {
					current.adjustedY = prev.adjustedY + minSpacing;
				}
			}

			// Ensure labels don't go off the bottom
			const maxY = chartHeight - labelHeight;
			for (let i = positions.length - 1; i >= 0; i--) {
				if (positions[i].adjustedY > maxY) {
					positions[i].adjustedY = maxY;
					// Push previous labels up if needed
					for (let j = i - 1; j >= 0; j--) {
						const next = positions[j + 1];
						const current = positions[j];
						if (next.adjustedY - current.adjustedY < minSpacing) {
							current.adjustedY = next.adjustedY - minSpacing;
						}
					}
				}
			}
		}

		// Create a map for easy lookup
		const positionMap = new Map();
		positions.forEach(p => {
			positionMap.set(p.line.headline, p.adjustedY);
		});

		return positionMap;
	}

	let labelPositions = $derived(calculateLabelPositions(filteredLines, processedData.timePoints));
</script>

<div class="w-full" style="margin-bottom: 30px;">
	{#if header}
		<h2 class="text-2xl font-bold mb-2">{header}</h2>
	{/if}

	{#if standfirst}
		<p class="mb-2">{standfirst}</p>
	{/if}

	{#if !loading && !error && processedData.lines.length > 0}
		<div class="mb-4 flex flex-wrap gap-4 items-center">
			<button
				onclick={() => (showMostPersistent = !showMostPersistent)}
				class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
			>
				{showMostPersistent ? 'Show Current Top 10' : 'Show Most Persistent Stories'}
			</button>
			<div class="relative flex-1 min-w-[200px]">
				<input
					type="text"
					bind:value={localSearchTerm}
					placeholder="Search headlines..."
					class="w-full px-3 py-2 pr-8 border border-black rounded text-sm focus:outline-none focus:ring-0"
					style="outline: none; box-shadow: none;"
				/>
				{#if localSearchTerm}
					<button
						onclick={() => (localSearchTerm = '')}
						class="absolute inset-y-0 right-0 flex items-center pr-2"
						aria-label="Clear search"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				{/if}
			</div>
		</div>
	{/if}

	{#if isTooNarrow}
		<div class="p-8 text-center border border-black rounded bg-transparent">
			<p class="font-bold text-lg mb-2">Wide screens only</p>
			<p class="text-sm">This chart is only available on screens 800px or wider. You could try rotating your phone, but its better on a computer.</p>
		</div>
	{:else if loading}
		<div class="flex justify-center items-center py-8">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
			<strong class="font-bold">Error:</strong>
			<span class="block sm:inline">{error}</span>
		</div>
	{:else if processedData.lines.length === 0}
		<div class="text-center py-8">No data available for bump chart</div>
	{:else}
		<div class="overflow-x-auto">
			<svg
				{width}
				{height}
				class="bg-transparent"
			>
				<g transform="translate({margin.left}, {margin.top})">
					<!-- Time axis labels -->
					{#each processedData.timePoints as timePoint, i}
						{@const x = getX(i, processedData.timePoints)}
						{@const lastIndex = processedData.timePoints.length - 1}
						{@const stepsFromEnd = lastIndex - i}
						{@const showTick = stepsFromEnd % 8 === 0}
						{#if showTick}
							<text
								x={x}
								y={-10}
								text-anchor="middle"
								class="text-xs"
								fill="#000000"
							>
								{formatMelbourneTime(timePoint)}
							</text>
						{/if}
					{/each}

					<!-- Rank axis labels -->
					{#each Array(10) as _, i}
						{@const rank = i + 1}
						{@const y = getY(rank)}
						<text
							x={-10}
							y={y + 4}
							text-anchor="end"
							class="text-xs"
							fill="#000000"
						>
							{rank}
						</text>
					{/each}

					<!-- Y-axis label -->
					<text
						x={-30}
						y={chartHeight / 2}
						text-anchor="middle"
						transform="rotate(-90, {-30}, {chartHeight / 2})"
						class="text-xs font-bold"
						fill="#000000"
					>
						Rank
					</text>

					<!-- Horizontal grid lines for ranks -->
					{#each Array(10) as _, i}
						{@const rank = i + 1}
						{@const y = getY(rank)}
						<line
							x1={0}
							y1={y}
							x2={chartWidth}
							y2={y}
							stroke="#999999"
							stroke-width="1"
							stroke-dasharray="4,4"
							opacity="0.3"
						/>
					{/each}

					<!-- Lines (drawn first, will be behind labels) -->
					{#each processedData.lines as line, i}
						{@const path = generatePath(line, processedData.timePoints)}
						{@const color = getColor(line)}
						<path
							d={path}
							fill="none"
							stroke={color}
							stroke-width={getLineWidth(line)}
							opacity={getLineOpacity(line)}
							class="cursor-pointer transition-all duration-200"
							onmouseenter={() => (hoveredLine = line.headline)}
							onmouseleave={() => (hoveredLine = null)}
						/>

						<!-- Points -->
						{#each line.points as point}
							{@const timeIndex = processedData.timePoints.indexOf(point.time)}
							{@const x = getX(timeIndex, processedData.timePoints)}
							{@const y = getY(point.rank)}
							<circle
								cx={x}
								cy={y}
								r={hoveredLine === line.headline ? 5 : 3}
								fill={color}
								opacity={getLineOpacity(line)}
								class="cursor-pointer transition-all duration-200"
								onmouseenter={() => (hoveredLine = line.headline)}
								onmouseleave={() => (hoveredLine = null)}
							/>
						{/each}
					{/each}

					<!-- Labels (drawn last, will be on top) -->
					{#each processedData.lines as line}
						{#if shouldShowLabel(line)}
							{@const lastPoint = line.points[line.points.length - 1]}
							{@const lastTimeIndex = processedData.timePoints.indexOf(lastPoint.time)}
							{@const lastX = getX(lastTimeIndex, processedData.timePoints)}
							{@const lastY = labelPositions.get(line.headline) ?? getY(lastPoint.rank)}
							{@const headlineWords = line.headline.split(' ')}
							{@const maxCharsPerLine = 35}
							{@const wrappedText = (() => {
								const lines = [];
								let currentLine = '';
								for (const word of headlineWords) {
									if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
										currentLine = (currentLine + ' ' + word).trim();
									} else {
										if (currentLine) lines.push(currentLine);
										currentLine = word;
									}
								}
								if (currentLine) lines.push(currentLine);
								return lines.slice(0, 3);
							})()}
							{@const color = getColor(line)}
							<foreignObject
								x={lastX + 10}
								y={lastY - 15}
								width="250"
								height="60"
								onmouseenter={() => (hoveredLine = line.headline)}
								onmouseleave={() => (hoveredLine = null)}
							>
								<div
									style="
										background-color: {backgroundColor};
										border: 1px solid #000000;
										padding: 3px 5px;
										font-size: 11px;
										font-weight: 500;
										color: {color};
										display: inline-block;
										line-height: 1.3;
										max-width: fit-content;
										cursor: pointer;
									"
								>
									{#each wrappedText as textLine, lineIndex}
										{textLine}{lineIndex === 2 && headlineWords.length > wrappedText.join(' ').split(' ').length ? '...' : ''}{#if lineIndex < wrappedText.length - 1}<br />{/if}
									{/each}
								</div>
							</foreignObject>
						{/if}
					{/each}
				</g>
			</svg>
		</div>

		<!-- <div class="mt-4 text-xs text-gray-600">
			<p>
				Showing {filteredLines.length} of {processedData.lines.length} headlines tracked across {processedData.timePoints.length} time periods.
				Hover over lines to highlight them.
			</p>
		</div> -->
	{/if}
</div>
