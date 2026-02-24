<script>
	import DataTable from '$lib/components/DataTable.svelte';
	import WikiTable from '$lib/components/WikiTable.svelte';
	import BskyTable from '$lib/components/BskyTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import BumpChart from '$lib/components/BumpChart.svelte';
	import WikiEditsTable from '$lib/components/WikiEditsTable.svelte';
	import { onMount } from 'svelte';

	let backToTopVisible = false;
	let searchTerm = $state('');
	let bumpChartContainer;
	let bumpChartWidth = $state(800);

	onMount(() => {
		const handleScroll = () => {
			backToTopVisible = window.scrollY > 300;
		};

		const updateWidth = () => {
			if (bumpChartContainer) {
				bumpChartWidth = bumpChartContainer.clientWidth;
			}
		};

		// Initial width
		updateWidth();

		// Update on resize
		const resizeObserver = new ResizeObserver(updateWidth);
		if (bumpChartContainer) {
			resizeObserver.observe(bumpChartContainer);
		}

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			resizeObserver.disconnect();
		};
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div class="container max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-4 text-center">Top stories</h1>

	<nav class="text-center mb-8">
		<div class="flex flex-wrap justify-center gap-4">
			<a href="#google" class="font-bold">Google News</a>
			<a href="#wikipedia" class="font-bold">Wikipedia</a>
			<a href="#abc" class="font-bold">ABC News</a>
			<a href="#newscom" class="font-bold">News.com.au</a>
			<a href="#age" class="font-bold">Age</a>
			<a href="#brisbane" class="font-bold">Brisbane Times</a>
			<a href="#smh" class="font-bold">SMH</a>
			<a href="#guardian" class="font-bold">Graun</a>
			<a href="#wiki-edits" class="font-bold">Wikipedia edits</a>
			<a href="#bsky" class="font-bold">Bluesky trends</a>
			<a href="#guardian-bump" class="font-bold">Bump Chart</a>
		</div>
	</nav>

		<SearchBar bind:searchTerm />

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<div id="google">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/google_top/latest.json"
				header="Google News"
				{searchTerm}
			/>
		</div>

		<div id="wikipedia">
			<WikiTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/wiki/latest.json"
				header="Wikipedia"
				exclude={["Main_Page", "Special:Search"]}
				{searchTerm}
			/>
		</div>
				<div id="wiki-edits">
			<WikiEditsTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/wiki_edits/latest.json"
				header="Wikipedia most edited"
				standfirst="7 day rolling, most edited wiki pages."
				exclude={["Main_Page", "Special:Search"]}
				{searchTerm}
			/>
		</div>
		<div id="abc">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/abc_top/latest.json"
				header="ABC News"
				{searchTerm}
			/>
		</div>

		<div id="bbc">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/bbc_top/latest.json"
				header="BBC"
				{searchTerm}
			/>
		</div>

		<div id="age">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/age/latest.json"
				header="The Age"
				{searchTerm}
			/>
		</div>

		<div id="brisbane">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/brisbane_times/latest.json"
				header="Brisbane Times"
				{searchTerm}
			/>
		</div>

		<div id="smh">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/smh_top/latest.json"
				header="Sydney Morning Herald"
				{searchTerm}
			/>
		</div>

		<div id="guardian">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/graun_top/latest.json"
				header="The Guardian"
				{searchTerm}
			/>
		</div>

		<div id="bsky">
			<BskyTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/bsky/latest.json"
				header="Bluesky trends"
				{searchTerm}
			/>
		</div>
		<div id="newscom">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/newscom_top/latest.json"
				header="News.com.au"
				{searchTerm}
			/>
		</div>

				<!-- <div id="wiki-edits">
			<WikiEditsTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/wiki_edits/latest.json"
				header="Wikipedia most edited"
				standfirst="7 day rolling, most edited wiki pages"
				exclude={["Main_Page", "Special:Search"]}
				{searchTerm}
			/>
		</div> -->
<!-- 
		<div id="bsky">
			<BskyTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/bsky/latest.json"
				header="Bluesky trends"
				{searchTerm}
			/>
		</div> -->

	</div>

	<div id="guardian-bump" class="mt-8" bind:this={bumpChartContainer}>
		<BumpChart
			url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Combined/graun.json"
			header="Most read over the past two days"
			standfirst=""
			containerWidth={bumpChartWidth}
			backgroundColor="#ffd861"
		/>
	</div>

	<footer class="text-center mt-8 py-4 text-gray-500 text-sm">
		<p>These are from the "most read" sections on websites. Wikipedia only updates once a day. Everything else runs about once an hour during the day. Occasionally a scraper will fail. All times are Melbourne time.</p>
	</footer>
</div>

{#if backToTopVisible}
	<button
		onclick={scrollToTop}
		class="fixed bottom-4 right-4 bg-[#ff5a00] text-white p-3 rounded-full transition-all duration-300 z-50"
		aria-label="Back to top"
	>
		↑
	</button>
{/if}
