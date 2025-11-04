interface AppFooterProps {
	userId: string | null;
}

export default function AppFooter({ userId }: AppFooterProps) {
	return (
		<footer className="footer bg-dark py-3 mt-auto">
			<div className="container text-center">
				{userId ? (
					<p className="mb-0 small text-white-50">
						Jouw bezoeker ID: <span className="text-white fw-semibold">{userId}</span>
					</p>
				) : (
					<p className="mb-0 small text-white-50">Verbinden...</p>
				)}
			</div>
		</footer>
	);
}

