import { useEffect, useState, type PropsWithChildren } from 'react'

import { initAnonymousAuth, observeAuth } from '../firebaseClient'

export default function AppLayout({ children }: PropsWithChildren) {
  const [authError, setAuthError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

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
            {userId ? (
              <span className="tag is-light is-medium mt-3">
                Your visitor ID: <strong className="ml-2">{userId}</strong>
              </span>
            ) : (
              <span className="tag is-light is-medium mt-3">Connecting…</span>
            )}
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
    </div>
  )
}

