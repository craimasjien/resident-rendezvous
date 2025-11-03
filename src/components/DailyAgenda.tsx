import { useState, useMemo } from 'react'

import { useVisits } from '@/hooks/useVisits'

import BookingModal from './BookingModal'

interface DailyAgendaProps {
  selectedDate: string
}

const dayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

const summarizeDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }

  return `${hours} hr ${remainingMinutes} min`
}

export default function DailyAgenda({ selectedDate }: DailyAgendaProps) {
  const { visits, isLoading, error } = useVisits()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formattedDate = useMemo(() => {
    const parsedDate = new Date(`${selectedDate}T00:00:00`)
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Unknown date'
    }
    return dayFormatter.format(parsedDate)
  }, [selectedDate])

  const dailyVisits = useMemo(
    () => visits.filter(visit => visit.date === selectedDate),
    [visits, selectedDate],
  )

  return (
    <>
      <div className="daily-agenda">
        <header className="mb-5">
          <p className="title is-4">Visits on {formattedDate}</p>
          <p className="subtitle is-6">
            {isLoading
              ? 'Loading visits...'
              : error
                ? 'Unable to load visits. Please refresh the page.'
                : 'The family agenda updates instantly as you browse.'}
          </p>
        </header>

        {error && (
          <div className="notification is-danger mb-4" role="alert">
            <strong>Error loading visits:</strong> {error.message}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {dailyVisits.length > 0 ? (
              <div className="agenda-list">
                {dailyVisits.map(visit => (
                  <article key={visit.id} className="card mb-4">
                    <div className="card-content">
                      <p className="title is-5 mb-2">
                        {visit.time} — {visit.visitorName}
                      </p>
                      <p className="subtitle is-6 mb-3">
                        {summarizeDuration(visit.durationMinutes)}
                      </p>
                      {visit.description ? <p>{visit.description}</p> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="notification is-light" role="status">
                No visits scheduled yet. Be the first to plan a stop by!
              </div>
            )}
          </>
        )}

        <div className="mt-5">
          <button
            type="button"
            className="button is-primary is-fullwidth"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
          >
            Schedule a Visit
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedDate}
      />
    </>
  )
}


