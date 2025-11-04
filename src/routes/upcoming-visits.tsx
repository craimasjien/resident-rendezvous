import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Clock, User } from 'lucide-react'

import { useVisits } from '@/hooks/useVisits'
import type { Visit } from '@/types/visit'
import EmptyVisitsState from '@/components/visits/EmptyVisitsState'

export const Route = createFileRoute('/upcoming-visits')({
	component: UpcomingVisitsRoute,
})

const dayFormatter = new Intl.DateTimeFormat('nl', {
	weekday: 'long',
	month: 'long',
	day: 'numeric',
})

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
					<EmptyVisitsState isLoading={isLoading} error={error} />
				)}

				{!isLoading && !error && visits.length > 0 && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
						{visitsByDate.map(({ date, visits: dayVisits }) => (
							<div key={date} style={{
								background: 'white',
								borderRadius: 'var(--radius-lg)',
								boxShadow: 'var(--shadow-sm)',
								border: '1px solid var(--gray-200)',
								overflow: 'hidden'
							}}>
								<div style={{
									padding: '0.75rem 1rem',
									background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
									borderBottom: '1px solid var(--gray-200)'
								}}>
									<div className="d-flex align-items-center">
										<Calendar size={18} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
										<span style={{ 
											fontWeight: '600',
											fontSize: '1rem',
											color: 'var(--gray-900)'
										}}>
											{formatDate(date)}
										</span>
									</div>
								</div>
								<div style={{ padding: '0.5rem' }}>
									{dayVisits.map(visit => (
										<div
											key={visit.id}
											className="d-flex align-items-center justify-content-between"
											style={{
												padding: '0.75rem 1rem',
												borderRadius: 'var(--radius-md)',
												transition: 'background-color 0.2s'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--gray-50)'
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'transparent'
											}}
										>
											<div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
												<div style={{
													width: '36px',
													height: '36px',
													borderRadius: '8px',
													background: 'var(--gray-100)',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													marginRight: '0.75rem',
													flexShrink: 0
												}}>
													<Clock size={16} className="text-secondary" />
												</div>
												<span style={{ 
													fontWeight: '600',
													color: 'var(--gray-900)',
													marginRight: '1rem',
													minWidth: '60px',
													flexShrink: 0
												}}>
													{visit.time}
												</span>
												<div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
													<User size={16} style={{ marginRight: '0.5rem', color: 'var(--gray-500)', flexShrink: 0 }} />
													<span style={{ 
														color: 'var(--gray-700)',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap'
													}}>
														{visit.visitorName}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
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
