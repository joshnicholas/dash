<script>
	let { searchTerm = $bindable(''), placeholder = 'Search across sites...' } = $props();

	function handleInput(event) {
		searchTerm = event.target.value;
	}

	function clearSearch() {
		searchTerm = '';
	}
</script>

<div class="relative w-full max-w-md mx-auto mb-6">
	<div class="relative">
		<input
			type="text"
			{placeholder}
			value={searchTerm}
			oninput={handleInput}
			class="w-full px-4 py-2 pl-10 pr-10 text-sm border border-black rounded-lg focus:outline-none focus:border-black"
		/>
		<div class="absolute inset-y-0 left-0 flex items-center pl-3">
			<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
			</svg>
		</div>
		{#if searchTerm}
			<button
				onclick={clearSearch}
				class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
				aria-label="Clear search"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		{/if}
	</div>
</div>