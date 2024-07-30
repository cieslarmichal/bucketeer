import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useEffect } from 'react';

import { CookieService } from '../modules/common/services/cookieService/cookieService';
import { useUserStore } from '../modules/core/stores/userStore/userStore';
import { useUserTokensStore } from '../modules/core/stores/userTokens/userTokens';
import { useLogoutUserMutation } from '../modules/user/api/user/mutations/logoutMutation/logoutMutation';
import { useFindMeQuery } from '../modules/user/api/user/queries/findMeQuery/findMeQuery';

import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent(): JSX.Element {
  const accessToken = useUserTokensStore((userTokens) => userTokens.accessToken);

  const refreshToken = useUserTokensStore((userTokens) => userTokens.refreshToken);

  const { mutateAsync: logout } = useLogoutUserMutation({});

  const removeTokens = useUserTokensStore((state) => state.removeTokens);

  const removeUserDetails = useUserStore((state) => state.removeUser);

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
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className="[&.active]:font-bold"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  search={{
                    bucketName: undefined,
                    page: 1,
                  }}
                  className="[&.active]:font-bold"
                >
                  Dashboard
                </Link>
                <Link
                  to="/"
                  onClick={async () => {
                    await logout({
                      id: data?.id as string,
                      refreshToken: refreshToken as string,
                      accessToken: accessToken as string,
                    });

                    removeTokens();

                    removeUserDetails();

                    CookieService.removeUserDataCookie();

                    CookieService.removeUserTokensCookie();
                  }}
                >
                  Logout
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
