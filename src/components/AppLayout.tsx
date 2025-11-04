import type { PropsWithChildren } from 'react'

import { useAuth } from '../hooks/useAuth'
import { useOfflineStatus } from '../hooks/useOfflineStatus'
import OfflineToast from './OfflineToast'
import AppHeader from './layout/AppHeader'
import AppFooter from './layout/AppFooter'

export default function AppLayout({ children }: PropsWithChildren) {
  const { userId, error: authError } = useAuth()
  const isOnline = useOfflineStatus()

  const appName = import.meta.env.VITE_APP_NAME || 'Resident Rendezvous'
  const appDescription = import.meta.env.VITE_APP_DESCRIPTION || 'Coordinate family visits with ease'

  return (
    <div className="app-layout">
      <AppHeader title={appName} description={appDescription} />

      <main className="py-5">
        <div className="container">
          {authError ? (
            <div className="alert alert-danger" role="alert">
              <h2 className="h5">We konden je niet anoniem aanmelden. Probeer het later nog eens.</h2>
              <p className="mb-0">{authError}</p>
            </div>
          ) : null}

          <div className="box">{children}</div>
        </div>
      </main>

      <AppFooter userId={userId} />

      <OfflineToast isOffline={!isOnline} />
    </div>
  )
}

