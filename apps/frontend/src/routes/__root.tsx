import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider
        defaultTheme="dark"
        storageKey="vite-ui-theme"
      >
        <div className="top-0 relative flex flex-1 justify-end w-full items-center">
          <div className="p-4 flex gap-4 items-center">
            <Link
              to="/"
              className="[&.active]:font-bold"
            >
              Home
            </Link>{' '}
            <Link
              to="/about"
              className="[&.active]:font-bold"
            >
              About
            </Link>
            <Link
              to="/dashboard"
              className="[&.active]:font-bold"
            >
              Dashboard
            </Link>
            <ModeToggle />
          </div>
        </div>
        <Outlet />
        {/* TODO: Make disabled for prod :) */}
        <TanStackRouterDevtools />
      </ThemeProvider>
    </>
  ),
});
