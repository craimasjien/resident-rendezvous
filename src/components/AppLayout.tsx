import { useEffect, useState, type PropsWithChildren } from 'react'

import { initAnonymousAuth, observeAuth } from '../firebaseClient'
import { useOfflineStatus } from '../hooks/useOfflineStatus'
import OfflineToast from './OfflineToast'

export default function AppLayout({ children }: PropsWithChildren) {
  const [authError, setAuthError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const isOnline = useOfflineStatus()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    initAnonymousAuth()
      .then(({ user }) => {
        setUserId(user.uid)
        unsubscribe = observeAuth(setUserId)
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Unexpected authentication error'
        setAuthError(message)
      })

    return () => {
      unsubscribe?.()
    }
  }, [])

  return (
    <div className="app-layout">
      <header className="bg-primary text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-2">{ import.meta.env.VITE_APP_NAME || 'Resident Rendezvous' }</h1>
          <p className="lead mb-0">{ import.meta.env.VITE_APP_DESCRIPTION || 'Coordinate family visits with ease' }</p>
        </div>
      </header>

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

      <footer className="footer bg-dark text-light py-4 mt-auto">
        <div className="container text-center">
          {userId ? (
            <p className="mb-0">
              <small className="text-muted">
              Jouw bezoeker ID: <strong className="text-primary">{userId}</strong>
              </small>
            </p>
          ) : (
            <p className="mb-0 text-muted">Verbinden...</p>
          )}
        </div>
      </footer>

      <OfflineToast isOffline={!isOnline} />
    </div>
  )
}

