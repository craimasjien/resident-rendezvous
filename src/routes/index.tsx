import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeRoute,
});

function HomeRoute() {
	return (
		<div className="box has-text-centered">
			<h2 className="title is-4">Welcome to Resident Rendezvous</h2>
			<p className="subtitle is-6">
				Phase 0 is in place. Bulma styling is active and Firebase bootstrap is
				ready.
			</p>

			<div className="content">
				<p>
					Next up: connect Firestore, wire up the calendar shell, and bring the
					shared visit agenda to life.
				</p>
			</div>

			<div className="buttons is-centered mt-4">
				<a
					className="button is-primary is-light"
					href="https://firebase.google.com/docs/auth/web/anonymous-auth"
					target="_blank"
					rel="noreferrer"
				>
					Review anonymous auth
				</a>
				<a
					className="button is-link is-light"
					href="https://bulma.io/documentation/"
					target="_blank"
					rel="noreferrer"
				>
					Bulma documentation
				</a>
			</div>
		</div>
	);
}
