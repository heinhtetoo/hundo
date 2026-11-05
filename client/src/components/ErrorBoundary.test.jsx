import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary.jsx';

const BOUNDARY_LABEL = 'ErrorBoundary caught a render error';

function Bomb({ error }) {
  throw error;
}

function Healthy() {
  return <p>Healthy page</p>;
}

function renderBoundary({ resetKey, children }) {
  return (
    <MemoryRouter>
      <ErrorBoundary resetKey={resetKey}>{children}</ErrorBoundary>
    </MemoryRouter>
  );
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders the fallback and hides the child when a child throws', () => {
    render(
      renderBoundary({
        resetKey: '/a',
        children: <Bomb error={new Error('boom')} />,
      }),
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to backlog' }),
    ).toHaveAttribute('href', '/backlog');
  });

  it('renders the child and no fallback when nothing throws', () => {
    render(renderBoundary({ resetKey: '/a', children: <Healthy /> }));

    expect(screen.getByText('Healthy page')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('logs the labelled error instance to console.error', () => {
    const thrown = new Error('boom');

    render(
      renderBoundary({ resetKey: '/a', children: <Bomb error={thrown} /> }),
    );

    const labelledCall = consoleErrorSpy.mock.calls.find(
      ([label, error]) => label === BOUNDARY_LABEL && error === thrown,
    );
    expect(labelledCall).toBeDefined();
  });

  it('clears the fallback when resetKey changes and the child recovers', () => {
    const { rerender } = render(
      renderBoundary({
        resetKey: '/a',
        children: <Bomb error={new Error('boom')} />,
      }),
    );

    rerender(renderBoundary({ resetKey: '/b', children: <Healthy /> }));

    expect(screen.getByText('Healthy page')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('keeps the fallback when resetKey is unchanged on re-render', () => {
    const { rerender } = render(
      renderBoundary({
        resetKey: '/a',
        children: <Bomb error={new Error('boom')} />,
      }),
    );

    rerender(renderBoundary({ resetKey: '/a', children: <Healthy /> }));

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Healthy page')).not.toBeInTheDocument();
  });
});
