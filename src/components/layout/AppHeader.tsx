interface AppHeaderProps {
	title: string;
	description: string;
}

export default function AppHeader({ title, description }: AppHeaderProps) {
	return (
		<header className="bg-primary text-white py-5">
			<div className="container text-center">
				<h1 className="display-4 fw-bold mb-2">{title}</h1>
				<p className="lead mb-0">{description}</p>
			</div>
		</header>
	);
}

