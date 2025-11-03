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
      <section className="hero is-primary">
        <div className="hero-body">
          <div className="container has-text-centered">
            <p className="title">{ import.meta.env.VITE_APP_NAME }</p>
            <p className="subtitle">{ import.meta.env.VITE_APP_DESCRIPTION }</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {authError ? (
            <div className="notification is-danger" role="alert">
              <h2 className="title is-5">We konden je niet anoniem aanmelden. Probeer het later nog eens.</h2>
              <p>{authError}</p>
            </div>
          ) : null}

          <div className="box">{children}</div>
        </div>
      </section>

      <footer className="footer">
        <div className="content has-text-centered">
          {userId ? (
            <p className="subtitle is-6">
              <span className="is-size-7 has-text-grey mt-2">
              Jouw bezoeker ID: <strong className="has-text-primary">{userId}</strong>
              </span>
            </p>
          ) : (
            <p className="subtitle is-6 has-text-grey">Connecting…</p>
          )}
        </div>
      </footer>

      <OfflineToast isOffline={!isOnline} />
    </div>
  )
}

