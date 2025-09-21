<script>
	import { timeParse, timeFormat } from 'd3-time-format';
	import { fuzzySearch } from '$lib/utils/search.js';

	let { url, header, standfirst, rowLimit = 5, showPub = false, searchTerm = '' } = $props();

	let data = $state([]);
	let loading = $state(true);
	let error = $state(null);

	const parseDate = timeParse('%Y_%m_%d_%H');
	const formatTime = timeFormat('%-I%p');
	const formatDateTime = timeFormat('%-I%p %d/%m/%Y');

	let filteredData = $derived(fuzzySearch(data, searchTerm, 0.5, ['Headline', 'publication']));

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
	// $effect(() => {
	// 	console.log(header, data)
	// })
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
			Last scraped: ~{(() => {
				const parsed = parseDate(data[0]?.scraped_datetime);
				return parsed ? formatDateTime(parsed).toLowerCase() : '';
			})()}
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
							<th class="px-1 py-2 text-left text-xs font-bold tracking-wider">Headline</th>
							{#if showPub}
								<th class="px-1 py-2 text-left text-xs font-bold tracking-wider w-20">Publication</th>
							{/if}
							<th class="px-1 py-2 text-left text-xs font-bold tracking-wider w-12">Rank</th>
						</tr>
					</thead>
					<tbody class="bg-transparent divide-y divide-black">
						{#each filteredData as item, index}
							<tr class="{index % 2 === 1 ? 'bg-yellow-100' : ''}" style="{index % 2 === 1 ? 'background-color: #fce18d;' : ''}">
								<td class="px-1 py-2 text-sm">
									{item.Headline}
									{#if item.Url} - 
										<a href={item.Url} target="_blank" rel="noopener noreferrer"
										   class="font-bold">
											Link
										</a>
									{/if}
								</td>
								{#if showPub}
									<td class="px-1 py-2 text-xs w-20">
										{item.publication}
									</td>
								{/if}
								<td class="px-1 py-2 text-xs font-medium w-12 text-center">
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