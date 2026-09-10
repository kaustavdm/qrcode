<script lang="ts" module>
  export async function svgToBadgeDataUrl(svg: string, size = 128): Promise<string> {
    const wrapped = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/><g transform="translate(${size * 0.15},${size * 0.15}) scale(${(size * 0.7) / 24})">${svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(wrapped)}`;
  }
</script>

<script lang="ts">
  let { svg, size = 128 }: { svg: string; size?: number } = $props();
</script>

<div class="badge" style:width="{size}px" style:height="{size}px">
  {@html svg}
</div>

<style>
  .badge {
    background: white;
    border-radius: 50%;
    display: grid;
    place-items: center;
    box-shadow: var(--shadow-1);
  }
  .badge :global(svg) {
    width: 70%;
    height: 70%;
  }
</style>
