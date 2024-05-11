import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useEffect } from 'react';

import { useFindMeQuery } from '../api/user/all/queries/findMeQuery/findMe';
import { useUserStore } from '../core/stores/userStore/userStore';
import { useUserTokensStore } from '../core/stores/userTokens/userTokens';

import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent(): JSX.Element {
  const accessToken = useUserTokensStore((userTokens) => userTokens.accessToken);

  const { data } = useFindMeQuery({
    accessToken: accessToken as string,
  });

  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (data?.email) {
      setUser(data);
    }
  }, [data, setUser]);

  const userRole = useUserStore((state) => state.user.role);

  return (
    <>
      <ThemeProvider
        defaultTheme="dark"
        storageKey="vite-ui-theme"
      >
        <div className="top-0 relative flex flex-1 justify-end w-full items-center">
          <div className="p-4 flex gap-4 items-center">
            {accessToken ? (
              <>
                <Link
                  to="/"
                  className="[&.active]:font-bold"
                >
                  Home
                </Link>{' '}
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className="[&.active]:font-bold"
                  >
                    Admin
                  </Link>
                )}
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
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="[&.active]:font-bold"
                >
                  Login
                </Link>
              </>
            )}
            <ModeToggle />
          </div>
        </div>
        <Outlet />
        {/* TODO: Make disabled for prod :) */}
        <TanStackRouterDevtools />
      </ThemeProvider>
    </>
  );
}
