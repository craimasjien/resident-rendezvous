import { useState, useMemo } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { useNavigate } from '@tanstack/react-router'

import { getVisitsCollection } from '@/firebase/visitsCollection'
import { useVisits } from '@/hooks/useVisits'
import { useCurrentUserId } from '@/hooks/useCurrentUserId'
import type { Visit } from '@/types/visit'

import BookingModal from './BookingModal'
import VisitCard from './VisitCard'

interface DailyAgendaProps {
  selectedDate: string
}

const dayFormatter = new Intl.DateTimeFormat('nl', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export default function DailyAgenda({ selectedDate }: DailyAgendaProps) {
  const navigate = useNavigate()
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
    if (!window.confirm(`Weet je zeker dat je ${visit.visitorName}'s bezoek wilt verwijderen?`)) {
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

  const handleVisitCreated = (date: string) => {
    // Navigate to index page with the date parameter
    navigate({ to: '/', search: { date }, replace: true })
  }

  return (
    <>
      <div className="daily-agenda">
        <header className="mb-5" style={{ marginBottom: '2.5rem' }}>
          <h2 className="h4 mb-3" style={{ marginBottom: '1.25rem' }}>Geplande bezoeken op {formattedDate}</h2>
          <p className="text-muted mb-4" style={{ 
            marginBottom: '2rem',
            lineHeight: '1.7',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            paddingBottom: '0.5rem'
          }}>
            {isLoading
              ? 'Bezoeken laden...'
              : error
                ? 'Het laden van de bezoeken is mislukt. Probeer het later nog eens.'
                : 'De volgende bezoeken zijn gepland:' }
          </p>
        </header>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <strong>Het laden van de bezoeken is mislukt:</strong> {error.message}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {dailyVisits.length > 0 ? (
              <div className="agenda-list">
                {dailyVisits.map(visit => {
                  const isOwner = currentUserId !== null && visit.userId === currentUserId
                  return (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      isOwner={isOwner}
                      isDeleting={deletingVisitId === visit.id}
                      onEdit={handleEditVisit}
                      onDelete={handleDeleteVisit}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="alert alert-light" role="status" style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                border: '2px dashed var(--gray-300)',
                borderRadius: 'var(--radius-xl)'
              }}>
                <p style={{ 
                  fontSize: '1.125rem',
                  color: 'var(--gray-700)',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Er zijn nog geen bezoeken gepland. Wees de eerste die langskomt! 🎉
                </p>
              </div>
            )}
          </>
        )}

        <div className="mt-5">
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
            style={{
              fontSize: '1.0625rem',
              fontWeight: '600',
              padding: '1rem 1.5rem',
              boxShadow: 'var(--shadow-primary)'
            }}
          >
            Plan een bezoek
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialDate={selectedDate}
        editingVisit={editingVisit}
        onVisitCreated={handleVisitCreated}
      />
    </>
  )
}


