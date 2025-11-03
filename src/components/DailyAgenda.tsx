import { useMemo } from 'react'

interface MockVisit {
  id: string
  date: string
  time: string
  visitorName: string
  durationMinutes: number
  description?: string
}

const MOCK_VISITS: MockVisit[] = [
  {
    id: 'visit-1',
    date: '2025-11-03',
    time: '09:30',
    visitorName: 'Alice',
    durationMinutes: 60,
    description: 'Coffee catch-up in the courtyard',
  },
  {
    id: 'visit-2',
    date: '2025-11-03',
    time: '14:00',
    visitorName: 'Marcus',
    durationMinutes: 45,
    description: 'Walk around the rose garden',
  },
  {
    id: 'visit-3',
    date: '2025-11-04',
    time: '11:00',
    visitorName: 'Priya',
    durationMinutes: 30,
    description: 'Drop off fresh baked cookies',
  },
]

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
  const formattedDate = useMemo(() => {
    const parsedDate = new Date(`${selectedDate}T00:00:00`)
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Unknown date'
    }
    return dayFormatter.format(parsedDate)
  }, [selectedDate])

  const dailyVisits = useMemo(
    () => MOCK_VISITS.filter(visit => visit.date === selectedDate),
    [selectedDate],
  )

  return (
    <div className="daily-agenda">
      <header className="mb-5">
        <p className="title is-4">Visits on {formattedDate}</p>
        <p className="subtitle is-6">
          This agenda is using placeholder visits until Firestore is connected.
        </p>
      </header>

      {dailyVisits.length > 0 ? (
        <div className="agenda-list">
          {dailyVisits.map(visit => (
            <article key={visit.id} className="card mb-4">
              <div className="card-content">
                <p className="title is-5 mb-2">
                  {visit.time} — {visit.visitorName}
                </p>
                <p className="subtitle is-6 mb-3">{summarizeDuration(visit.durationMinutes)}</p>
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

      <div className="mt-5">
        <button type="button" className="button is-primary is-fullwidth">
          Schedule a Visit
        </button>
      </div>
    </div>
  )
}


