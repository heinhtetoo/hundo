import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RatingBar from './RatingBar.jsx';

describe('RatingBar', () => {
  it('renders ten static segments and no buttons without an onChange prop', () => {
    render(<RatingBar value={5} label="Rating" />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('calls onChange with the clicked segment value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingBar value="" onChange={onChange} label="Rating" />);

    await user.click(screen.getByRole('button', { name: 'Rate 7 out of 10' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith(7);
  });

  it('shows the current value out of 10 in the header', () => {
    render(<RatingBar value={7} onChange={vi.fn()} label="Rating" />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('/ 10')).toBeInTheDocument();
  });

  it('shows an em dash in the header when no value is set', () => {
    render(<RatingBar value="" onChange={vi.fn()} label="Rating" />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders no Clear control when nothing is rated yet', () => {
    render(<RatingBar value="" onChange={vi.fn()} label="Rating" />);

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('calls onChange with an empty string when Clear is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingBar value={7} onChange={onChange} label="Rating" />);

    await user.click(screen.getByText('Clear'));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('');
  });
});
