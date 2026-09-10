import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import UrlForm from './UrlForm.svelte';

describe('UrlForm', () => {
  it('emits payload on input', async () => {
    const onchange = vi.fn();
    render(UrlForm, { value: { text: '' }, onchange });
    const input = screen.getByLabelText(/text or url/i);
    await fireEvent.input(input, { target: { value: 'https://a' } });
    expect(onchange).toHaveBeenCalledWith({ text: 'https://a' });
  });

  it('shows validation for empty input on blur', async () => {
    render(UrlForm, { value: { text: '' }, onchange: () => {} });
    const input = screen.getByLabelText(/text or url/i);
    await fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
  });
});
