/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthPages } from "./pages/auth/AuthPages";
import { AppLayout } from "./layouts/AppLayout";

const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useApp();

  // If not authenticated, force Auth page wizard feeds (login, signup, password resets)
  if (!isAuthenticated) {
    return <AuthPages />;
  }

  // Otherwise, render full workspace dashboard layouts
  return <AppLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

