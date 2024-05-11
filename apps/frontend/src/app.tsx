import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { createAppRouter } from './core/router/router';
import { useUserStore } from './core/stores/userStore/userStore';
import { useUserTokensStore } from './core/stores/userTokens/userTokens';
import { CookieService } from './services/cookieService/cookieService';

// Create a new router instance
const router = createAppRouter();

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('app')!;

function WrappedApp(): JSX.Element {
  const setUserTokens = useUserTokensStore((state) => state.setTokens);

  const userTokensCookie = CookieService.getUserTokensCookie();

  if (userTokensCookie && userTokensCookie !== '') {
    const tokens = JSON.parse(userTokensCookie);

    setUserTokens(tokens);
  }

  const accessToken = useUserTokensStore((state) => state.accessToken);

  const refreshToken = useUserTokensStore((state) => state.refreshToken);

  const isLoggedIn = accessToken !== null && refreshToken !== null;

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
