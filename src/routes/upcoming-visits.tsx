import { useMemo } from 'react'
import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Clock, User } from 'lucide-react'

import { useVisits } from '@/hooks/useVisits'
import type { Visit } from '@/types/visit'

export const Route = createFileRoute('/upcoming-visits')({
	component: UpcomingVisitsRoute,
})

const dayFormatter = new Intl.DateTimeFormat('nl', {
	weekday: 'long',
	month: 'long',
	day: 'numeric',
})

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

	// Group visits by date
	const visitsByDate = useMemo(() => {
		const grouped = new Map<string, Visit[]>()
		
		visits.forEach(visit => {
			const dateKey = visit.date
			if (!grouped.has(dateKey)) {
				grouped.set(dateKey, [])
			}
			grouped.get(dateKey)!.push(visit)
		})

		// Sort dates and visits within each date group
		const sortedDates = Array.from(grouped.keys()).sort()
		const result: Array<{ date: string; visits: Visit[] }> = []
		
		sortedDates.forEach(date => {
			const dayVisits = grouped.get(date)!
			// Sort visits by time within each day
			dayVisits.sort((a, b) => a.time.localeCompare(b.time))
			result.push({ date, visits: dayVisits })
		})

		return result
	}, [visits])

	return (
		<>
			<div className="upcoming-visits-route">
				<section className="content mb-5" style={{ 
					padding: '2rem',
					background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
					borderRadius: 'var(--radius-xl)',
					border: '1px solid var(--gray-200)'
				}}>
					<h2 className="h4" style={{ marginBottom: '1rem' }}>Alle komende bezoeken</h2>
					<p className="text-muted mb-2" style={{ 
						marginBottom: '1rem', 
						lineHeight: '1.7',
						wordWrap: 'break-word',
						overflowWrap: 'break-word'
					}}>
						Overzicht van alle geplande bezoeken vanaf vandaag. Zie wie er komt en wanneer.
					</p>
				</section>

				{error && (
					<div className="alert alert-danger mb-4" role="alert">
						<strong>Het laden van de bezoeken is mislukt:</strong> {error.message}
					</div>
				)}

				{!isLoading && !error && visits.length === 0 && (
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
							Er zijn nog geen komende bezoeken gepland. Wees de eerste die langskomt! 🎉
						</p>
					</div>
				)}

				{!isLoading && !error && visits.length > 0 && (
					<div className="table-responsive" style={{
						background: 'white',
						borderRadius: 'var(--radius-lg)',
						boxShadow: 'var(--shadow-md)',
						border: '1px solid var(--gray-200)'
					}}>
						<table className="table table-striped table-hover mb-0">
							<thead>
								<tr>
									<th style={{ 
										background: 'var(--gray-50)',
										fontWeight: '600',
										color: 'var(--gray-900)',
										padding: '1rem'
									}}>
										<div className="d-flex align-items-center">
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
										<div className="d-flex align-items-center">
											<User size={18} style={{ marginRight: '0.5rem' }} />
											<span>Bezoeker</span>
										</div>
									</th>
								</tr>
							</thead>
							<tbody>
								{visitsByDate.map(({ date, visits: dayVisits }) => (
									<React.Fragment key={date}>
										<tr style={{ 
											background: 'var(--gray-100)',
											borderTop: '2px solid var(--gray-300)'
										}}>
											<td colSpan={2} style={{ 
												padding: '1rem',
												fontWeight: '600',
												fontSize: '1.1rem',
												color: 'var(--gray-900)'
											}}>
												<div className="d-flex align-items-center">
													<Calendar size={20} style={{ marginRight: '0.75rem' }} />
													<span>{formatDate(date)}</span>
												</div>
											</td>
										</tr>
										{dayVisits.map(visit => {
											const departureTime = calculateDepartureTime(visit.time, visit.durationMinutes)

											return (
												<tr key={visit.id}>
													<td style={{ padding: '1rem', verticalAlign: 'middle' }}>
														<div>
															<span className="fw-semibold">{visit.time}</span>
															<span className="text-secondary" style={{ marginLeft: '0.5rem' }}>
																- {departureTime}
															</span>
														</div>
													</td>
													<td style={{ padding: '1rem', verticalAlign: 'middle' }}>
														<span className="fw-medium">{visit.visitorName}</span>
													</td>
												</tr>
											)
										})}
									</React.Fragment>
								))}
							</tbody>
						</table>
					</div>
				)}

				{isLoading && (
					<div className="text-center" style={{ padding: '3rem' }}>
						<p className="text-muted">Bezoeken laden...</p>
					</div>
				)}
			</div>
		</>
	)
}
