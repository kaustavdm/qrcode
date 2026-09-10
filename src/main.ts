import './app.css';
import './lib/theme/tokens.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { initTheme } from './lib/theme/theme.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('Missing #app element');

initTheme();

export default mount(App, { target });
