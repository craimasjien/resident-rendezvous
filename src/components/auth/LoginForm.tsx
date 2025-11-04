import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { signInWithEmail, signInWithGoogle } from "@/firebaseClient";

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
			// Navigate immediately - auth state should be updated by Firebase
			// The dashboard route will handle admin verification via useRequireAdmin
			navigate({ to: "/dashboard" });
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Inloggen mislukt";
			setError(errorMessage);
			setIsSubmitting(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setError(null);
		setIsSubmitting(true);

		try {
			await signInWithGoogle();
			// Navigate immediately - auth state should be updated by Firebase
			// The dashboard route will handle admin verification via useRequireAdmin
			navigate({ to: "/dashboard" });
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Google inloggen mislukt";
			setError(errorMessage);
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

					<div className="mt-4">
						<div className="d-flex align-items-center mb-3">
							<div className="flex-grow-1 border-top"></div>
							<span className="mx-3 text-muted small">of</span>
							<div className="flex-grow-1 border-top"></div>
						</div>

						<button
							type="button"
							onClick={handleGoogleSignIn}
							className={`btn btn-outline-secondary w-100 ${isSubmitting ? "disabled" : ""}`}
							disabled={isSubmitting}
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "0.5rem",
							}}
						>
							{isSubmitting && (
								<span
									className="spinner-border spinner-border-sm"
									role="status"
									aria-hidden="true"
								></span>
							)}
							<svg
								width="18"
								height="18"
								viewBox="0 0 18 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
									fill="#4285F4"
								/>
								<path
									d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
									fill="#34A853"
								/>
								<path
									d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.951H.957C.348 6.173 0 7.548 0 9s.348 2.827.957 4.049l3.007-2.342z"
									fill="#FBBC05"
								/>
								<path
									d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.951L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
									fill="#EA4335"
								/>
							</svg>
							Inloggen met Google
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

