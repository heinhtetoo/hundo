import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BacklogEntryForm from './BacklogEntryForm.jsx';

const baseEntry = {
  status: 'playing',
  rating: 6,
  hours_played: 4,
  notes: 'On chapter three.',
};

function submitButton() {
  return screen.getByRole('button', { name: /add to backlog|save changes/i });
}

describe('BacklogEntryForm', () => {
  it('submits null rating and null hoursPlayed when both are left empty', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<BacklogEntryForm onSave={onSave} />);

    await user.click(submitButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ rating: null, hoursPlayed: null }),
      expect.anything(),
    );
  });

  it('rejects notes over 2000 characters and never calls onSave', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<BacklogEntryForm onSave={onSave} />);

    const notes = screen.getByPlaceholderText('Your thoughts…');
    await user.click(notes);
    await user.paste('a'.repeat(2001));
    await user.click(submitButton());

    expect(
      await screen.findByText(/at most 2000 character/i),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('rejects negative hours and never calls onSave', async () => {
    const onSave = vi.fn();
    const { container } = render(<BacklogEntryForm onSave={onSave} />);

    const hours = screen.getByPlaceholderText('—');
    fireEvent.change(hours, { target: { value: '-5' } });
    // fireEvent.submit dispatches the submit event directly, bypassing the
    // native min="0" constraint check a real click would trigger first, so
    // this exercises the zod validation path the falsifier targets.
    fireEvent.submit(container.querySelector('form'));

    expect(
      await screen.findByText(/greater than or equal to 0/i),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits the status selected via the status buttons', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<BacklogEntryForm onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'completed' }));
    await user.click(submitButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' }),
      expect.anything(),
    );
  });

  it('shows a confirmation instead of removing on the first Remove click', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <BacklogEntryForm entry={baseEntry} onSave={vi.fn()} onRemove={onRemove} />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(screen.getByText('Remove this entry?')).toBeInTheDocument();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('calls onRemove once when the confirmation is accepted', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <BacklogEntryForm entry={baseEntry} onSave={vi.fn()} onRemove={onRemove} />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Yes, remove' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('cancels the confirmation without calling onRemove', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <BacklogEntryForm entry={baseEntry} onSave={vi.fn()} onRemove={onRemove} />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('labels the form for creation with no entry and for editing with one', () => {
    const { rerender } = render(<BacklogEntryForm onSave={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Add to backlog' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();

    rerender(<BacklogEntryForm entry={baseEntry} onSave={vi.fn()} onRemove={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('resets its fields when rerendered with a different entry', () => {
    const otherEntry = {
      status: 'completed',
      rating: 9,
      hours_played: 20,
      notes: 'Finished it.',
    };
    const { rerender } = render(
      <BacklogEntryForm entry={baseEntry} onSave={vi.fn()} onRemove={vi.fn()} />,
    );

    rerender(
      <BacklogEntryForm entry={otherEntry} onSave={vi.fn()} onRemove={vi.fn()} />,
    );

    expect(screen.getByPlaceholderText('—')).toHaveValue(20);
    expect(screen.getByPlaceholderText('Your thoughts…')).toHaveValue(
      'Finished it.',
    );
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'completed' }).className,
    ).toMatch(/text-brand/);
  });

  it('shows the hours-vs-average delta once an average exists', async () => {
    const user = userEvent.setup();
    render(<BacklogEntryForm onSave={vi.fn()} avgPlaytime={10} />);

    await user.type(screen.getByPlaceholderText('—'), '12');

    expect(await screen.findByText(/\+2h vs avg/)).toBeInTheDocument();
  });

  it('renders no average line when avgPlaytime is 0', () => {
    render(<BacklogEntryForm onSave={vi.fn()} avgPlaytime={0} />);

    expect(screen.queryByText(/Avg for this game/)).not.toBeInTheDocument();
  });
});
