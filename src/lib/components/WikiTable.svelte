<script>
	import { timeParse, timeFormat } from 'd3-time-format';

	let { url, header, standfirst, rowLimit = 5, showPub = false, exclude = [] } = $props();

	let data = $state([]);
	let loading = $state(true);
	let error = $state(null);

	const parseDate = timeParse('%Y_%m_%d_%H');
	const formatTime = timeFormat('%-I%p');
	const formatDateTime = timeFormat('%-I %p %d/%m/%Y');

	// Filter function to exclude items
	function shouldExclude(item) {
		// Check if Page contains "Wikipedia:"
		if (item.Page && item.Page.includes('Wikipedia:')) {
			return true;
		}
		// Check if Page is in the exclude array
		if (exclude.includes(item.Page)) {
			return true;
		}
		return false;
	}

	let filteredData = $derived(data.filter(item => !shouldExclude(item)));

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
</script>

<div class="w-full mb-5">
	{#if header}
		<h2 class="text-2xl font-bold mb-2">{header}</h2>
	{/if}

	{#if standfirst}
		<p class="text-gray-600 mb-2">{standfirst}</p>
	{/if}

	{#if filteredData.length > 0}
		<p class="text-gray-500 text-sm mb-4">
			Last scraped: {(() => {
				const parsed = parseDate(filteredData[0].scraped_datetime);
				return parsed ? formatDateTime(parsed).toLowerCase() : '';
			})()}
		</p>
	{/if}

	{#if loading}
		<div class="flex justify-center items-center py-8">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
			<strong class="font-bold">Error:</strong>
			<span class="block sm:inline">{error}</span>
		</div>
	{:else if filteredData.length === 0}
		<div class="text-center py-8 text-gray-500">
			No data available
		</div>
	{:else}
		<div class="rounded-lg">
			<div class="max-h-96 overflow-y-scroll">
				<table class="w-full bg-white table-fixed">
					<thead class="bg-gray-50 sticky top-0">
						<tr>
							<th class="px-1 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">Page</th>
							<th class="px-1 py-2 text-left text-xs font-medium text-gray-500 tracking-wider w-20">Views</th>
							<th class="px-1 py-2 text-left text-xs font-medium text-gray-500 tracking-wider w-12">Rank</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredData as item, index}
							<tr>
								<td class="px-1 py-2 text-sm text-gray-900">
									{item.Page.replace(/_/g, ' ')}
									<a href="https://en.wikipedia.org/wiki/{item.Page}" target="_blank" rel="noopener noreferrer"
									   class="text-blue-600 hover:text-blue-800 hover:underline ml-1">
										(Link)
									</a>
								</td>
								<td class="px-1 py-2 text-xs text-gray-900 w-20">
									{item.Views?.toLocaleString()}
								</td>
								<td class="px-1 py-2 text-xs font-medium text-gray-900 w-12 text-center">
									{item.Rank}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>