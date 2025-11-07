import { Edit2, Trash2, Clock, User, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react'

import type { Visit } from '@/types/visit'
import { sanitizeText } from '@/utils/sanitize'
import { calculateDepartureTime, formatDuration } from '@/utils/timeUtils'
import IconContainer from '@/components/ui/IconContainer'

interface VisitCardProps {
  visit: Visit
  isOwner: boolean
  isDeleting: boolean
  onEdit: (visit: Visit) => void
  onDelete: (visit: Visit) => void
}

export default function VisitCard({
  visit,
  isOwner,
  isDeleting,
  onEdit,
  onDelete,
}: VisitCardProps) {
  const departureTime = calculateDepartureTime(visit.time, visit.durationMinutes)
  const durationText = formatDuration(visit.durationMinutes)

  return (
    <article
      className={`card mb-4 ${isOwner ? 'border-success border-start border-4' : ''}`}
    >
      <div className="card-body">
        <div className="d-flex visit-card-mobile-layout justify-content-between align-items-start mb-4">
          <div className="flex-grow-1" style={{ width: '100%' }}>
            <div className="d-flex align-items-center mb-4">
              <IconContainer variant="primary" size={40} className="d-flex align-items-center justify-content-center">
                <User size={20} className="text-white" />
              </IconContainer>
              <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                <h3 className="h4 mb-0">
                  {visit.visitorName}
                </h3>
                {visit.verified && (
                  <span 
                    className="badge bg-success d-flex align-items-center" 
                    style={{ gap: '0.25rem', fontSize: '0.75rem' }}
                    title="Geverifieerde gebruiker"
                  >
                    <CheckCircle2 size={14} />
                    Geverifieerde gebruiker
                  </span>
                )}
              </div>
            </div>

            <div className="content">
              <div className="d-flex align-items-center visit-detail-item" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <IconContainer>
                  <Clock size={16} className="text-secondary" />
                </IconContainer>
                <span className="fw-semibold">Geplande aankomst:</span>
                <span style={{ color: 'var(--gray-700)' }}>{visit.time}</span>
              </div>

              <div className="d-flex align-items-center visit-detail-item" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <IconContainer>
                  <Clock size={16} className="text-secondary" />
                </IconContainer>
                <span className="fw-semibold">Gepland vertrek:</span>
                <span style={{ color: 'var(--gray-700)' }}>{departureTime}</span>
              </div>

              <div className="d-flex align-items-center visit-detail-item" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <IconContainer>
                  <Calendar size={16} className="text-secondary" />
                </IconContainer>
                <span className="fw-semibold">Duur van bezoek:</span>
                <span style={{ color: 'var(--gray-700)' }}>{durationText}</span>
              </div>

              {visit.description && (
                <div className="d-flex align-items-start mt-4" style={{ gap: '0.5rem' }}>
                  <IconContainer style={{ marginTop: '0.25rem' }}>
                    <MessageSquare size={16} className="text-secondary" />
                  </IconContainer>
                  <div style={{ flex: 1 }}>
                    <span className="fw-semibold">Opmerkingen:</span>
                    <p style={{ 
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--gray-700)',
                      lineHeight: '1.6'
                    }}>{sanitizeText(visit.description)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* {isOwner && ( */}
            <div 
              className="btn-group visit-card-buttons" 
              style={{ 
                marginLeft: '1rem',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => onEdit(visit)}
                aria-label={`Edit visit by ${visit.visitorName}`}
                title="Edit visit"
                disabled={isDeleting}
                style={{ 
                  minWidth: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Edit2 size={18} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-light btn-danger"
                onClick={() => onDelete(visit)}
                aria-label={`Delete visit by ${visit.visitorName}`}
                title="Delete visit"
                disabled={isDeleting}
                style={{ 
                  minWidth: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          {/* )} */}
        </div>
      </div>
    </article>
  )
}

