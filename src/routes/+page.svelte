<script>
	import DataTable from '$lib/components/DataTable.svelte';
	import WikiTable from '$lib/components/WikiTable.svelte';
</script>

<div class="container max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-4 text-center">Top stories</h1>

	<nav class="text-center mb-8">
		<div class="flex flex-wrap justify-center gap-4">
			<a href="#google" class="text-blue-600 hover:text-blue-800 hover:underline">Google News</a>
			<a href="#wikipedia" class="text-blue-600 hover:text-blue-800 hover:underline">Wikipedia</a>
			<a href="#abc" class="text-blue-600 hover:text-blue-800 hover:underline">ABC News</a>
			<a href="#newscom" class="text-blue-600 hover:text-blue-800 hover:underline">News.com.au</a>
			<a href="#age" class="text-blue-600 hover:text-blue-800 hover:underline">Age</a>
			<a href="#brisbane" class="text-blue-600 hover:text-blue-800 hover:underline">Brisbane Times</a>
			<a href="#smh" class="text-blue-600 hover:text-blue-800 hover:underline">SMH</a>
			<a href="#guardian" class="text-blue-600 hover:text-blue-800 hover:underline">Graun</a>
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
