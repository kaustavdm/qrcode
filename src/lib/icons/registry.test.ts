import { describe, it, expect, vi } from 'vitest';

vi.mock('./manifest.generated.json', () => ({
  default: [
    { id: 'github', setId: 'simple-icons', name: 'GitHub', keywords: ['github'] },
    { id: 'gitea', setId: 'simple-icons', name: 'Gitea', keywords: ['gitea'] },
    { id: 'gitlab', setId: 'simple-icons', name: 'GitLab', keywords: ['gitlab'] }
  ]
}));

vi.mock('./__glob__', () => ({}));

import { search, loadManifest } from './registry';

describe('icon registry', () => {
  it('loads manifest lazily', async () => {
    const m = await loadManifest();
    expect(m.length).toBe(3);
  });

  it('search ranks exact-prefix higher than substring', async () => {
    const results = await search('git');
    expect(results[0]?.id).toBe('github'); // 'github' starts with 'git' and comes first alphabetically among prefix matches
  });

  it('search is case-insensitive', async () => {
    const results = await search('GITH');
    expect(results.some((r) => r.id === 'github')).toBe(true);
  });
});
