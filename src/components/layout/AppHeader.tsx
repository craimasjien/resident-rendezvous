import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
	title: string;
	description: string;
}

export default function AppHeader({ title, description }: AppHeaderProps) {
	const { isAdmin, signOut } = useAuth();

	return (
		<header className="bg-primary text-white py-5">
			<div className="container">
				{/* Navigation bar */}
				<nav className="d-flex justify-content-end mb-3">
					{isAdmin ? (
						<>
							<Link
								to="/dashboard"
								className="btn btn-outline-light me-2"
								style={{ textDecoration: "none" }}
							>
								Dashboard
							</Link>
							<button
								type="button"
								className="btn btn-outline-light"
								onClick={signOut}
							>
								Uitloggen
							</button>
						</>
					) : (
						<Link
							to="/login"
							className="btn btn-outline-light"
							style={{ textDecoration: "none" }}
						>
							Beheerder Login
						</Link>
					)}
				</nav>

				{/* Title and description */}
				<div className="text-center">
					<h1 className="display-4 fw-bold mb-2">{title}</h1>
					<p className="lead mb-0">{description}</p>
				</div>
			</div>
		</header>
	);
}

