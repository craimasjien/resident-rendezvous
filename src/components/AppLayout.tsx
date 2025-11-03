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
            <p className="title">Resident Rendezvous</p>
            <p className="subtitle">Plan loving visits together, without the hassle.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {authError ? (
            <div className="notification is-danger" role="alert">
              <h2 className="title is-5">We couldn't start anonymous sign-in</h2>
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
              Your Visitor ID: <strong className="has-text-primary">{userId}</strong>
              <br />
              <span className="is-size-7 has-text-grey mt-2">
                Share this ID with family members to coordinate visits together
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

