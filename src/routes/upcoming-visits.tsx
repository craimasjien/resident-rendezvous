import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Clock, User, MessageSquare } from 'lucide-react'

import { useVisits } from '@/hooks/useVisits'
import { sanitizeText } from '@/utils/sanitize'

export const Route = createFileRoute('/upcoming-visits')({
	component: UpcomingVisitsRoute,
})

const dayFormatter = new Intl.DateTimeFormat('nl', {
	weekday: 'long',
	month: 'long',
	day: 'numeric',
})

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

function UpcomingVisitsRoute() {
	const { visits, isLoading, error } = useVisits()

	const formatDate = (dateStr: string) => {
		const parsedDate = new Date(`${dateStr}T00:00:00`)
		if (Number.isNaN(parsedDate.getTime())) {
			return dateStr
		}
		return dayFormatter.format(parsedDate)
	}

	return (
		<>
			<div className="upcoming-visits-route">
				<section className="content mb-6" style={{ 
					padding: '2rem',
					background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
					borderRadius: 'var(--radius-xl)',
					border: '1px solid var(--gray-200)'
				}}>
					<h2 className="title is-4" style={{ marginBottom: '1rem' }}>Alle komende bezoeken</h2>
					<p className="subtitle is-6" style={{ 
						marginBottom: '1rem', 
						color: 'var(--gray-700)',
						lineHeight: '1.7',
						wordWrap: 'break-word',
						overflowWrap: 'break-word'
					}}>
						Overzicht van alle geplande bezoeken vanaf vandaag. Zie wie er komt en wanneer.
					</p>
				</section>

				{error && (
					<div className="notification is-danger mb-4" role="alert">
						<strong>Het laden van de bezoeken is mislukt:</strong> {error.message}
					</div>
				)}

				{!isLoading && !error && visits.length === 0 && (
					<div className="notification is-light" role="status" style={{
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
							Er zijn nog geen komende bezoeken gepland. Wees de eerste die langskomt! 🎉
						</p>
					</div>
				)}

				{!isLoading && !error && visits.length > 0 && (
					<div className="table-container" style={{
						overflowX: 'auto',
						background: 'white',
						borderRadius: 'var(--radius-lg)',
						boxShadow: 'var(--shadow-md)',
						border: '1px solid var(--gray-200)'
					}}>
						<table className="table is-fullwidth is-striped is-hoverable" style={{ margin: 0 }}>
							<thead>
								<tr>
									<th style={{ 
										background: 'var(--gray-50)',
										fontWeight: '600',
										color: 'var(--gray-900)',
										padding: '1rem'
									}}>
										<div className="is-flex is-align-items-center">
											<Calendar size={18} style={{ marginRight: '0.5rem' }} />
											<span>Datum</span>
										</div>
									</th>
									<th style={{ 
										background: 'var(--gray-50)',
										fontWeight: '600',
										color: 'var(--gray-900)',
										padding: '1rem'
									}}>
										<div className="is-flex is-align-items-center">
											<Clock size={18} style={{ marginRight: '0.5rem' }} />
											<span>Tijd</span>
										</div>
									</th>
									<th style={{ 
										background: 'var(--gray-50)',
										fontWeight: '600',
										color: 'var(--gray-900)',
										padding: '1rem'
									}}>
										<div className="is-flex is-align-items-center">
											<User size={18} style={{ marginRight: '0.5rem' }} />
											<span>Bezoeker</span>
										</div>
									</th>
								</tr>
							</thead>
							<tbody>
								{visits.map(visit => {
									const departureTime = calculateDepartureTime(visit.time, visit.durationMinutes)
									const durationText = summarizeDuration(visit.durationMinutes)

									return (
										<tr key={visit.id}>
											<td style={{ padding: '1rem', verticalAlign: 'middle' }}>
												<span className="has-text-weight-semibold">{formatDate(visit.date)}</span>
											</td>
											<td style={{ padding: '1rem', verticalAlign: 'middle' }}>
												<div>
													<span className="has-text-weight-semibold">{visit.time}</span>
													<span className="has-text-grey" style={{ marginLeft: '0.5rem' }}>
														- {departureTime}
													</span>
												</div>
											</td>
											<td style={{ padding: '1rem', verticalAlign: 'middle' }}>
												<span className="has-text-weight-medium">{visit.visitorName}</span>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				)}

				{isLoading && (
					<div className="has-text-centered" style={{ padding: '3rem' }}>
						<p className="subtitle is-6 has-text-grey">Bezoeken laden...</p>
					</div>
				)}
			</div>
		</>
	)
}
