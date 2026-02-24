<script>
	import { fuzzySearch } from '$lib/utils/search.js';

	let { url, header, standfirst, searchTerm = '' } = $props();

	let data = $state([]);
	let loading = $state(true);
	let error = $state(null);

	const melbFormatter = new Intl.DateTimeFormat('en-AU', {
		timeZone: 'Australia/Melbourne',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
		day: '2-digit',
		month: '2-digit'
	});

	function formatMelbourne(published) {
		if (!published) return '';
		const d = new Date(published);
		if (isNaN(d)) return published;
		return melbFormatter.format(d).toLowerCase();
	}

	let sortedData = $derived(
		[...data].sort((a, b) => new Date(b.published) - new Date(a.published))
	);

	let filteredData = $derived(fuzzySearch(sortedData, searchTerm, 0.5, ['Headline', 'Entry']));

	async function fetchData() {
		try {
			loading = true;
			error = null;
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			data = await response.json();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (url) fetchData();
	});
</script>

<div class="w-full" style="margin-bottom: 30px;">
	{#if header}
		<h2 class="text-2xl font-bold mb-2">{header}</h2>
	{/if}

	{#if standfirst}
		<p class="mb-2">{standfirst}</p>
	{/if}

	{#if filteredData.length > 0}
		<p class="text-xs">
			Last scraped: ~{formatMelbourne(data[0]?.scraped_datetime?.replace(/(\d{4})_(\d{2})_(\d{2})_(\d{2})/, '$1-$2-$3T$4:00:00+10:00'))}
		</p>
	{/if}

	{#if loading}
		<div class="flex justify-center items-center py-8">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
			<strong class="font-bold">Error:</strong>
			<span class="block sm:inline">{error}</span>
		</div>
	{:else if filteredData.length === 0}
		<div class="text-center py-8">
			{searchTerm ? 'No matching results found' : 'No data available'}
		</div>
	{:else}
		<div class="rounded-lg">
			<div class="max-h-96 overflow-y-scroll">
				<table class="w-full bg-transparent table-fixed">
					<thead class="sticky top-0" style="background-color: #ffd861;">
						<tr>
							<th class="px-1 py-2 text-left text-xs font-bold tracking-wider">Trend</th>
							<th class="px-1 py-2 text-left text-xs font-bold tracking-wider w-16">Traffic</th>
							<th class="px-1 py-2 text-left text-xs font-bold tracking-wider w-24">Published</th>
						</tr>
					</thead>
					<tbody class="bg-transparent divide-y divide-black">
						{#each filteredData as item, index}
							<tr class="{index % 2 === 1 ? 'bg-yellow-100' : ''}" style="{index % 2 === 1 ? 'background-color: #fce18d;' : ''}">
								<td class="px-1 py-2 text-sm">
									<span class="font-medium">{item.Headline}</span>
									{#if item.Entry}
										<span class="text-xs text-gray-600 block">{item.Entry}{#if item.Url} – <a href={item.Url} target="_blank" rel="noopener noreferrer" class="font-bold">Link</a>{/if}</span>
									{/if}
								</td>
								<td class="px-1 py-2 text-xs w-16">{item.Traffic}</td>
								<td class="px-1 py-2 text-xs w-24">{formatMelbourne(item.published)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
