import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import AppLayout from '../components/AppLayout'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  ),
})
