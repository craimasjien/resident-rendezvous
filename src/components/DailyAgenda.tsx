import { useState, useMemo } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { Edit2, Trash2 } from 'lucide-react'

import { getVisitsCollection } from '@/firebase/visitsCollection'
import { useVisits } from '@/hooks/useVisits'
import { useCurrentUserId } from '@/hooks/useCurrentUserId'
import type { Visit } from '@/types/visit'
import { sanitizeText } from '@/utils/sanitize'

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
  const currentUserId = useCurrentUserId()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null)

  const formattedDate = useMemo(() => {
    const parsedDate = new Date(`${selectedDate}T00:00:00`)
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Unknown date'
    }
    return dayFormatter.format(parsedDate)
  }, [selectedDate])

  const dailyVisits = useMemo(() => {
    // Filter visits by selected date using ISO date string format
    const selectedDateISO = new Date(`${selectedDate}T00:00:00`).toISOString().slice(0, 10)
    return visits.filter(visit => {
      const visitDateISO = new Date(`${visit.date}T00:00:00`).toISOString().slice(0, 10)
      return visitDateISO === selectedDateISO
    })
  }, [visits, selectedDate])

  const handleDeleteVisit = async (visit: Visit) => {
    if (!window.confirm(`Are you sure you want to delete the visit by ${visit.visitorName}?`)) {
      return
    }

    setDeletingVisitId(visit.id)
    try {
      const collectionRef = getVisitsCollection()
      const visitDocRef = doc(collectionRef, visit.id)
      await deleteDoc(visitDocRef)
      // Firestore listener will automatically update the UI
    } catch (error) {
      console.error('Error deleting visit', error)
      alert(
        error instanceof Error
          ? `Failed to delete visit: ${error.message}`
          : 'Failed to delete visit. Please try again.',
      )
    } finally {
      setDeletingVisitId(null)
    }
  }

  const handleEditVisit = (visit: Visit) => {
    setEditingVisit(visit)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingVisit(null)
  }

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
                {dailyVisits.map(visit => {
                  const isOwner = currentUserId !== null && visit.userId === currentUserId
                  return (
                    <article
                      key={visit.id}
                      className={`card mb-4 ${isOwner ? 'is-success is-light' : ''}`}
                    >
                      <div className="card-content">
                        <div className="is-flex is-justify-content-space-between is-align-items-flex-start">
                          <div className="is-flex-grow-1">
                            <p className="title is-5 mb-2">
                              {visit.time} — {visit.visitorName}
                            </p>
                            <p className="subtitle is-6 mb-3">
                              {summarizeDuration(visit.durationMinutes)}
                            </p>
                            {visit.description ? (
                              <p>{sanitizeText(visit.description)}</p>
                            ) : null}
                          </div>
                          {isOwner && (
                            <div className="buttons has-addons">
                              <button
                                type="button"
                                className="button is-small is-light"
                                onClick={() => handleEditVisit(visit)}
                                aria-label={`Edit visit by ${visit.visitorName}`}
                                title="Edit visit"
                                disabled={deletingVisitId === visit.id}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                className="button is-small is-light is-danger"
                                onClick={() => handleDeleteVisit(visit)}
                                aria-label={`Delete visit by ${visit.visitorName}`}
                                title="Delete visit"
                                disabled={deletingVisitId === visit.id}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
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
        onClose={handleCloseModal}
        initialDate={selectedDate}
        editingVisit={editingVisit}
      />
    </>
  )
}


