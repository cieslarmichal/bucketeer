import { RouterProvider } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';

import { CookieService } from './modules/common/services/cookieService/cookieService';
import { createAppRouter } from './modules/core/router/router';
import { setUserSelector, useUserStore } from './modules/core/stores/userStore/userStore';
import { userAccessTokenSelector, userRefreshTokenSelector, useUserTokensStore } from './modules/core/stores/userTokens/userTokens';

// Create a new router instance
const router = createAppRouter();

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app')!;

function WrappedApp(): JSX.Element {
  const setUserTokens = useUserTokensStore((state) => state.setTokens);

  const userTokensCookie = CookieService.getUserTokensCookie();
  if (userTokensCookie && userTokensCookie !== '') {
    const tokens = JSON.parse(userTokensCookie);
    setUserTokens(tokens);
  }

  const accessToken = useUserTokensStore(userAccessTokenSelector);
  const refreshToken = useUserTokensStore(userRefreshTokenSelector);

  const isLoggedIn = useMemo(() =>
    accessToken && refreshToken, 
  [accessToken, refreshToken]);

  const userDataCookie = CookieService.getUserDataCookie();

  const setUserData = useUserStore(setUserSelector);

  if (userDataCookie) {
    const userData = JSON.parse(userDataCookie);

    setUserData(userData);
  }

  const userRole = useUserStore((state) => state.user.role);

  return (
    <RouterProvider
      router={router}
      context={{
        authenticated: isLoggedIn,
        role: userRole,
        accessToken,
      }}
    />
  );
}

if (!rootElement?.innerHTML) {
  // eslint-disable-next-line import/no-named-as-default-member
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <WrappedApp />
    </React.StrictMode>,
  );
}
