import { Edit2, Trash2, Clock, User, Calendar, MessageSquare } from 'lucide-react'

import type { Visit } from '@/types/visit'
import { sanitizeText } from '@/utils/sanitize'

interface VisitCardProps {
  visit: Visit
  isOwner: boolean
  isDeleting: boolean
  onEdit: (visit: Visit) => void
  onDelete: (visit: Visit) => void
}

const summarizeDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'uur' : 'uren'}`
  }

  return `${hours} uur en ${remainingMinutes} minuten`
}

const calculateDepartureTime = (arrivalTime: string, durationMinutes: number): string => {
  const [hours, minutes] = arrivalTime.split(':').map(Number)
  const arrivalDate = new Date()
  arrivalDate.setHours(hours, minutes, 0, 0)
  
  const departureDate = new Date(arrivalDate.getTime() + durationMinutes * 60000)
  const departureHours = departureDate.getHours().toString().padStart(2, '0')
  const departureMinutes = departureDate.getMinutes().toString().padStart(2, '0')
  
  return `${departureHours}:${departureMinutes}`
}

export default function VisitCard({
  visit,
  isOwner,
  isDeleting,
  onEdit,
  onDelete,
}: VisitCardProps) {
  const departureTime = calculateDepartureTime(visit.time, visit.durationMinutes)
  const durationText = summarizeDuration(visit.durationMinutes)

  return (
    <article
      className={`card mb-4 ${isOwner ? 'is-success is-light' : ''}`}
    >
      <div className="card-content">
        <div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-4">
          <div className="is-flex-grow-1">
            <div className="is-flex is-align-items-center mb-4">
              <User size={20} className="has-text-primary" style={{ marginRight: '0.5rem' }} />
              <h3 className="title is-4 mb-0">
                {visit.visitorName}
              </h3>
            </div>

            <div className="content">
              <div className="is-flex is-align-items-center mb-3">
                <Clock size={16} className="has-text-grey" style={{ marginRight: '0.5rem' }} />
                <span className="has-text-weight-semibold">Geplande aankomst:</span>
                <span style={{ marginLeft: '0.5rem' }}>{visit.time}</span>
              </div>

              <div className="is-flex is-align-items-center mb-3">
                <Clock size={16} className="has-text-grey" style={{ marginRight: '0.5rem' }} />
                <span className="has-text-weight-semibold">Gepland vertrek:</span>
                <span style={{ marginLeft: '0.5rem' }}>{departureTime}</span>
              </div>

              <div className="is-flex is-align-items-center mb-3">
                <Calendar size={16} className="has-text-grey" style={{ marginRight: '0.5rem' }} />
                <span className="has-text-weight-semibold">Duur van bezoek:</span>
                <span style={{ marginLeft: '0.5rem' }}>{durationText}</span>
              </div>

              {visit.description && (
                <div className="is-flex is-align-items-flex-start mt-4">
                  <MessageSquare 
                    size={16} 
                    className="has-text-grey" 
                    style={{ marginRight: '0.5rem', marginTop: '0.25rem' }} 
                  />
                  <span className="has-text-weight-semibold">Opmerkingen:</span>
                  <p style={{ marginLeft: '0.5rem' }}>{sanitizeText(visit.description)}</p>
                </div>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="buttons has-addons" style={{ marginLeft: '1rem' }}>
              <button
                type="button"
                className="button is-small is-light"
                onClick={() => onEdit(visit)}
                aria-label={`Edit visit by ${visit.visitorName}`}
                title="Edit visit"
                disabled={isDeleting}
              >
                <Edit2 size={16} />
              </button>
              <button
                type="button"
                className="button is-small is-light is-danger"
                onClick={() => onDelete(visit)}
                aria-label={`Delete visit by ${visit.visitorName}`}
                title="Delete visit"
                disabled={isDeleting}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

