import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext.jsx';
import { AppLayout } from './AppLayout.jsx';

let backlogShouldThrow;

function AlwaysCrashingPage() {
  throw new Error('page crashed');
}

function BacklogPage() {
  if (backlogShouldThrow) {
    throw new Error('backlog crashed');
  }
  return <p>Backlog page</p>;
}

function stubAuthenticatedFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: 1, email: 'player@example.com' } }),
    })),
  );
}

async function renderLayoutAt(initialPath) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/crash" element={<AlwaysCrashingPage />} />
              <Route path="/backlog" element={<BacklogPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await screen.findByRole('button', { name: 'Sign out' });
}

function desktopNavbar() {
  return within(screen.getAllByRole('navigation')[0]);
}

describe('AppLayout error boundary', () => {
  beforeEach(() => {
    backlogShouldThrow = false;
    stubAuthenticatedFetch();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('keeps the navbar usable when the routed page throws', async () => {
    await renderLayoutAt('/crash');

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sign out' }),
    ).toBeInTheDocument();
    expect(
      desktopNavbar().getByRole('link', { name: 'Backlog' }),
    ).toBeInTheDocument();
    expect(
      desktopNavbar().getByRole('link', { name: 'Discover' }),
    ).toBeInTheDocument();
  });

  it('clears the fallback when the navbar navigates to another page', async () => {
    const user = userEvent.setup();
    await renderLayoutAt('/crash');

    await user.click(desktopNavbar().getByRole('link', { name: 'Backlog' }));

    expect(screen.getByText('Backlog page')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('leads to the backlog from the fallback link after a crash elsewhere', async () => {
    const user = userEvent.setup();
    await renderLayoutAt('/crash');

    await user.click(screen.getByRole('link', { name: 'Back to backlog' }));

    expect(screen.getByText('Backlog page')).toBeInTheDocument();
  });

  it('recovers a crashed backlog page from the fallback link without a path change', async () => {
    const user = userEvent.setup();
    backlogShouldThrow = true;
    await renderLayoutAt('/backlog');
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    backlogShouldThrow = false;

    await user.click(screen.getByRole('link', { name: 'Back to backlog' }));

    expect(screen.getByText('Backlog page')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
