interface AppFooterProps {
	userId: string | null;
}

/**
 * Formats a build date timestamp to Dutch locale format
 */
function formatBuildDate(dateStr: string | undefined): string {
	if (!dateStr) return "";
	
	try {
		const date = new Date(dateStr);
		if (Number.isNaN(date.getTime())) return "";
		
		const formatter = new Intl.DateTimeFormat("nl", {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Europe/Amsterdam",
		});
		
		return formatter.format(date);
	} catch {
		return "";
	}
}

export default function AppFooter({ userId }: AppFooterProps) {
	const buildDate = import.meta.env.VITE_BUILD_DATE;
	const buildCommit = import.meta.env.VITE_BUILD_COMMIT;
	const buildCommitFull = import.meta.env.VITE_BUILD_COMMIT_FULL;
	const githubRepoUrl = import.meta.env.VITE_GITHUB_REPO_URL;
	const formattedBuildDate = formatBuildDate(buildDate);
	
	const commitUrl = githubRepoUrl && buildCommitFull 
		? `${githubRepoUrl}/commit/${buildCommitFull}`
		: null;
	
	return (
		<footer className="footer bg-dark py-3 mt-auto">
			<div className="container text-center">
				{userId ? (
					<>
						<p className="mb-0 small text-white-50">
							Jouw bezoeker ID: <span className="text-white fw-semibold">{userId}</span>
						</p>
						{(formattedBuildDate || buildCommit) && (
							<p className="mb-0 small text-white-50 mt-1">
								Laatst geupdatet:{" "}
								{formattedBuildDate && <span>{formattedBuildDate}</span>}
								{buildCommit && (
									<span>
										{formattedBuildDate ? " " : ""}
										{commitUrl ? (
											<a 
												href={commitUrl} 
												target="_blank" 
												rel="noopener noreferrer"
												className="text-white-50 text-decoration-underline"
												style={{ textUnderlineOffset: '2px' }}
											>
												({buildCommit})
											</a>
										) : (
											`(${buildCommit})`
										)}
									</span>
								)}
							</p>
						)}
					</>
				) : (
					<p className="mb-0 small text-white-50">Verbinden...</p>
				)}
			</div>
		</footer>
	);
}

