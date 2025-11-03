import { useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'

import DailyAgenda from '../components/DailyAgenda'
import VisitCalendar from '../components/VisitCalendar'

const resolveToday = () => new Date().toISOString().slice(0, 10)

export const Route = createFileRoute('/')({
	component: HomeRoute,
})

function HomeRoute() {
	const [selectedDate, setSelectedDate] = useState(resolveToday)

	return (
		<div className="home-route">
			<section className="content mb-6">
				<h2 className="title is-4">Coördineer bezoeken</h2>
				<p className="subtitle is-6">
					Selecteer een dag op de agenda om te bekijken wie op bezoek komt en hoe laat. De geplande bezoeken worden aan de rechterkant van de pagina getoond.
				</p>
				<p>
					Je kunt een bezoek plannen door op de knop onderin de pagina te klikken.
				</p>
				<p>
					Je kunt ook een bezoek wijzigen of verwijderen wat je zelf hebt gemaakt door op de bezoek te klikken en de knoppen onderin de pagina te klikken.
				</p>
			</section>

			<div className="columns is-variable is-5 is-multiline">
				<div className="column is-one-third-desktop is-full-tablet is-full-mobile">
					<VisitCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
				</div>
				<div className="column is-two-thirds-desktop is-full-tablet is-full-mobile">
					<DailyAgenda selectedDate={selectedDate} />
				</div>
			</div>
		</div>
	)
}
