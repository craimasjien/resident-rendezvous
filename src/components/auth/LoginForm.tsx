import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { signInWithEmail } from "@/firebaseClient";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			await signInWithEmail(email, password);
			// Navigate to dashboard on successful login
			navigate({ to: "/dashboard" });
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Inloggen mislukt";
			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="row justify-content-center">
			<div className="col-md-6 col-lg-4">
				<div
					style={{
						background: "white",
						borderRadius: "var(--radius-lg)",
						boxShadow: "var(--shadow-sm)",
						border: "1px solid var(--gray-200)",
						padding: "2rem",
					}}
				>
					<h2 className="h4 mb-4">Beheerder Login</h2>

					{error && (
						<div className="alert alert-danger mb-4" role="alert">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="mb-3">
							<label htmlFor="email" className="form-label">
								E-mailadres <span className="text-danger">*</span>
							</label>
							<input
								id="email"
								className="form-control"
								type="email"
								placeholder="voer@email.nl"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isSubmitting}
								required
								autoComplete="email"
							/>
						</div>

						<div className="mb-4">
							<label htmlFor="password" className="form-label">
								Wachtwoord <span className="text-danger">*</span>
							</label>
							<input
								id="password"
								className="form-control"
								type="password"
								placeholder="Wachtwoord"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isSubmitting}
								required
								autoComplete="current-password"
							/>
						</div>

						<button
							type="submit"
							className={`btn btn-primary w-100 ${isSubmitting ? "disabled" : ""}`}
							disabled={isSubmitting}
						>
							{isSubmitting && (
								<span
									className="spinner-border spinner-border-sm me-2"
									role="status"
									aria-hidden="true"
								></span>
							)}
							Inloggen
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

