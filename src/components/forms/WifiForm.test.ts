import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import WifiForm from './WifiForm.svelte';

describe('WifiForm', () => {
  it('hides password when auth = nopass', async () => {
    render(WifiForm, {
      value: { ssid: '', password: '', auth: 'nopass', hidden: false },
      onchange: () => {}
    });
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });

  it('shows password when auth = WPA', async () => {
    render(WifiForm, {
      value: { ssid: '', password: '', auth: 'WPA', hidden: false },
      onchange: () => {}
    });
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('emits toggled hidden', async () => {
    const onchange = vi.fn();
    render(WifiForm, { value: { ssid: 'x', password: 'y', auth: 'WPA', hidden: false }, onchange });
    const cb = screen.getByLabelText(/hidden network/i);
    await fireEvent.click(cb);
    expect(onchange).toHaveBeenCalledWith(expect.objectContaining({ hidden: true }));
  });
});
