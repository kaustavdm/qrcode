<script lang="ts">
  import Router from 'svelte-spa-router';
  import Layout from './routes/Layout.svelte';
  import Generator from './routes/Generator.svelte';
  import History from './routes/History.svelte';

  const routes = {
    '/': Generator,
    '/history': History
  };
</script>

<Layout>
  <Router {routes} />
</Layout>
