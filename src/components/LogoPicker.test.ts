import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import LogoPicker from './LogoPicker.svelte';

vi.mock('../lib/icons/registry', () => ({
  search: vi.fn(async () => [
    { id: 'github', setId: 'simple-icons', name: 'GitHub', keywords: ['github'] }
  ]),
  loadIconSvg: vi.fn(async () => '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1"/></svg>')
}));

describe('LogoPicker', () => {
  it('runs a search and shows results', async () => {
    render(LogoPicker, { value: { kind: 'none' }, onchange: () => {} });
    const input = screen.getByLabelText(/search icons/i);
    await fireEvent.input(input, { target: { value: 'git' } });
    expect(await screen.findByText('GitHub')).toBeInTheDocument();
  });

  it('emits library selection on click', async () => {
    const onchange = vi.fn();
    render(LogoPicker, { value: { kind: 'none' }, onchange });
    await fireEvent.input(screen.getByLabelText(/search icons/i), { target: { value: 'git' } });
    const btn = await screen.findByRole('button', { name: /GitHub/ });
    await fireEvent.click(btn);
    expect(onchange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'library', setId: 'simple-icons', iconId: 'github' }),
      expect.any(String),
      undefined
    );
  });
});
