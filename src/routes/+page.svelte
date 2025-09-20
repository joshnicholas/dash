<script>
	import DataTable from '$lib/components/DataTable.svelte';
	import WikiTable from '$lib/components/WikiTable.svelte';
	import { onMount } from 'svelte';

	let backToTopVisible = false;

	onMount(() => {
		const handleScroll = () => {
			backToTopVisible = window.scrollY > 300;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
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
		</div>
	</nav>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<div id="google">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/google_top/latest.json"
				header="Google News"
			/>
		</div>

		<div id="wikipedia">
			<WikiTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/wiki/latest.json"
				header="Wikipedia"
				exclude={["Main_Page", "Special:Search"]}
			/>
		</div>

		<div id="abc">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/abc_top/latest.json"
				header="ABC News"
			/>
		</div>

		<div id="newscom">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/newscom_top/latest.json"
				header="News.com.au"
			/>
		</div>

		<div id="age">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/age/latest.json"
				header="The Age"
			/>
		</div>

		<div id="brisbane">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/brisbane_times/latest.json"
				header="Brisbane Times"
			/>
		</div>

		<div id="smh">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/smh_top/latest.json"
				header="Sydney Morning Herald"
			/>
		</div>

		<div id="guardian">
			<DataTable
				url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/graun_top/latest.json"
				header="The Guardian"
			/>
		</div>


	</div>

	<footer class="text-center mt-8 py-4 text-gray-500 text-sm">
		<p>Wikipedia updates daily, everything else runs about every hour during the day. All times are Brisbane time.</p>
	</footer>
</div>

{#if backToTopVisible}
	<button
		on:click={scrollToTop}
		class="fixed bottom-4 right-4 bg-[#ff5a00] text-white p-3 rounded-full transition-all duration-300 z-50"
		aria-label="Back to top"
	>
		↑
	</button>
{/if}
