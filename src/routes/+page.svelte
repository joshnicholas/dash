<script>
	import DataTable from '$lib/components/DataTable.svelte';
	import WikiTable from '$lib/components/WikiTable.svelte';
</script>

<div class="container max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8 text-center">Top stories</h1>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<DataTable
			url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/google_top/latest.json"
			header="Google News"
		/>

          <WikiTable
    url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/wiki/latest.json"
    header="Wikipedia"
    exclude={["Main_Page", "Special:Search"]}
  />

		<DataTable
			url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/abc_top/latest.json"
			header="ABC News"
		/>

        		<DataTable
			url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/newscom_top/latest.json"
			header="News.com.au"
		/>

		<DataTable
			url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/age/latest.json"
			header="The Age"
		/>

		<DataTable
			url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/brisbane_times/latest.json"
			header="Brisbane Times"
		/>

		<DataTable
			url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/smh_top/latest.json"
			header="Sydney Morning Herald"
		/>

        		<DataTable
			url="https://raw.githubusercontent.com/joshnicholas/Archives/refs/heads/main/Archive/graun_top/latest.json"
			header="The Guardian"
		/>


	</div>

	<footer class="text-center mt-8 py-4 text-gray-500 text-sm">
		<p>Apart from Wikipedia, data updates regularly throughout the day. Wikipedia only updates daily. All times are Brisbane time.</p>
	</footer>
</div>
