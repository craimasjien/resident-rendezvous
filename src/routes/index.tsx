import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import DailyAgenda from '../components/DailyAgenda'
import VisitCalendar from '../components/VisitCalendar'

const resolveToday = () => {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export const Route = createFileRoute('/')({
	component: HomeRoute,
})

function HomeRoute() {
	const [selectedDate, setSelectedDate] = useState(() => resolveToday())

	// Update date immediately when changed via calendar
	const handleDateChange = (date: string) => {
		setSelectedDate(date)
	}

	return (
		<div className="home-route">
			<section className="content mb-5" style={{ 
				padding: '2rem',
				background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
				borderRadius: 'var(--radius-xl)',
				border: '1px solid var(--gray-200)'
			}}>
				<h2 className="h4" style={{ marginBottom: '1rem' }}>Coördineer bezoeken</h2>
				<p className="text-muted mb-2" style={{ 
					marginBottom: '1rem', 
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

			<div className="row g-4">
				<div className="col-md-4 col-12">
					<VisitCalendar selectedDate={selectedDate} onDateChange={handleDateChange} />
				</div>
				<div className="col-md-8 col-12">
					<DailyAgenda selectedDate={selectedDate} onDateChange={handleDateChange} />
				</div>
			</div>
		</div>
	)
}
