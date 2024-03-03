import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useStore } from 'zustand';

import { createAppRouter } from './core/router/router';
import { UserStoreContext, userStore } from './core/stores/userStore/userStore';
import { UserTokensStoreContext, userTokensStore } from './core/stores/userTokens/userTokens';

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
  const userTokens = useStore(userTokensStore);

  const isLoggedIn = userTokens.accessToken !== null && userTokens.refreshToken !== null;

  const user = useStore(userStore);

  return (
    <RouterProvider
      router={router}
      context={{
        authenticated: isLoggedIn,
        role: user.user.role,
      }}
    />
  );
}

if (!rootElement?.innerHTML) {
  // eslint-disable-next-line import/no-named-as-default-member
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <UserTokensStoreContext.Provider value={userTokensStore}>
        <UserStoreContext.Provider value={userStore}>
          <WrappedApp />
        </UserStoreContext.Provider>
      </UserTokensStoreContext.Provider>
    </React.StrictMode>,
  );
}
