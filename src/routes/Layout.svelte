<script lang="ts">
  import { setTheme, getTheme, resolvedTheme } from '../lib/theme/theme.svelte';
  import { link } from 'svelte-spa-router';

  let mode = $state(getTheme());

  function cycle() {
    const next = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    setTheme(next);
    mode = next;
  }

  let { children } = $props();
</script>

<header>
  <a href="/" use:link><strong>QR Code Generator</strong></a>
  <nav>
    <a href="/" use:link>Generator</a>
    <a href="/history" use:link>History</a>
    <button type="button" onclick={cycle} aria-label="Theme: {mode} (currently {resolvedTheme()})">
      {mode === 'system' ? 'Auto' : mode === 'light' ? 'Light' : 'Dark'}
    </button>
  </nav>
</header>

<main>
  {@render children()}
</main>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  header a {
    color: var(--fg);
    text-decoration: none;
  }
  nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 0.75rem;
    border-radius: var(--radius);
  }
  nav a:hover {
    background: var(--surface-elev);
  }
  nav {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  button {
    min-height: 44px;
    min-width: 44px;
    padding: 0 1rem;
    background: var(--surface-elev);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
  }
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
  }
</style>
