import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import DailyAgenda from '../components/DailyAgenda'
import VisitCalendar from '../components/VisitCalendar'

const resolveToday = () => new Date().toISOString().slice(0, 10)

// Check if a date string is before today
const isBeforeToday = (dateStr: string): boolean => {
	const today = resolveToday()
	return dateStr < today
}

// Validate date format: yyyy-MM-dd
const isValidDateString = (dateStr: string): boolean => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/
	if (!dateRegex.test(dateStr)) return false
	const date = new Date(dateStr)
	return date instanceof Date && !isNaN(date.getTime()) && dateStr === date.toISOString().slice(0, 10)
}

export const Route = createFileRoute('/')({
	validateSearch: (search: Record<string, unknown>) => {
		return {
			date: typeof search.date === 'string' && isValidDateString(search.date) ? search.date : undefined,
		}
	},
	component: HomeRoute,
})

function HomeRoute() {
	const navigate = useNavigate()
	const { date: urlDate } = Route.useSearch()
	const scrollPositionRef = useRef<number | null>(null)
	const isDateChangeRef = useRef(false)
	
	// Redirect to today if URL date is in the past
	useEffect(() => {
		if (urlDate && isBeforeToday(urlDate)) {
			navigate({ to: '/', search: { date: undefined }, replace: true })
		}
	}, [urlDate, navigate])
	
	// Restore scroll position after date-only URL changes
	useEffect(() => {
		if (isDateChangeRef.current && scrollPositionRef.current !== null) {
			// Use multiple attempts to ensure scroll restoration happens after TanStack Router's scroll restoration
			const restoreScroll = () => {
				if (scrollPositionRef.current !== null) {
					window.scrollTo(0, scrollPositionRef.current)
				}
			}
			
			// Try immediately
			restoreScroll()
			
			// Try on next frame
			requestAnimationFrame(() => {
				restoreScroll()
			})
			
			// Try after a short delay to ensure it happens after TanStack Router's scroll restoration
			setTimeout(() => {
				restoreScroll()
				isDateChangeRef.current = false
			}, 100)
		}
	}, [urlDate])
	
	// Use URL date if present and not in the past, otherwise default to today
	const selectedDate = urlDate && !isBeforeToday(urlDate) ? urlDate : resolveToday()

	// Update URL when date changes via calendar
	const handleDateChange = (date: string) => {
		const today = resolveToday()
		// Don't allow selecting dates in the past
		if (isBeforeToday(date)) {
			return
		}
		
		// Preserve scroll position before navigation
		scrollPositionRef.current = window.scrollY
		isDateChangeRef.current = true
		
		if (date === today) {
			// Remove date param if it's today
			navigate({ to: '/', search: { date: undefined }, replace: true })
		} else {
			// Set date param if it's not today
			navigate({ to: '/', search: { date }, replace: true })
		}
	}

	return (
		<div className="home-route">
			<section className="content mb-6" style={{ 
				padding: '2rem',
				background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
				borderRadius: 'var(--radius-xl)',
				border: '1px solid var(--gray-200)'
			}}>
				<h2 className="title is-4" style={{ marginBottom: '1rem' }}>Coördineer bezoeken</h2>
				<p className="subtitle is-6" style={{ 
					marginBottom: '1rem', 
					color: 'var(--gray-700)',
					lineHeight: '1.7',
					wordWrap: 'break-word',
					overflowWrap: 'break-word'
				}}>
					Selecteer een dag op de agenda om te bekijken wie op bezoek komt en hoe laat, de geplande bezoeken worden dan getoond. Je kunt een bezoek plannen door op de knop onderin de pagina te klikken.
				</p>
				<p style={{ 
					color: 'var(--gray-600)', 
					margin: 0,
					lineHeight: '1.7',
					wordWrap: 'break-word',
					overflowWrap: 'break-word',
					paddingTop: '0.5rem'
				}}>
					Je kunt ook een bezoek wijzigen of verwijderen dat je zelf hebt gemaakt.
				</p>
			</section>

			<div className="columns is-variable is-5 is-multiline">
				<div className="column is-one-third-desktop is-full-tablet is-full-mobile">
					<VisitCalendar selectedDate={selectedDate} onDateChange={handleDateChange} />
				</div>
				<div className="column is-two-thirds-desktop is-full-tablet is-full-mobile">
					<DailyAgenda selectedDate={selectedDate} />
				</div>
			</div>
		</div>
	)
}
