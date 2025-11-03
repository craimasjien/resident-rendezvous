import { useEffect, useState } from 'react';

interface OfflineToastProps {
	isOffline: boolean;
}

export default function OfflineToast({ isOffline }: OfflineToastProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOffline) {
			setIsVisible(true);
		} else {
			// Delay hiding to show "back online" message briefly
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isOffline]);

	if (!isVisible) {
		return null;
	}

	return (
		<div
			className={`alert alert-dismissible has-shadow${
				isOffline ? ' alert-warning' : ' alert-success'
			}`}
			style={{
				position: 'fixed',
				bottom: '20px',
				right: '20px',
				zIndex: 9999,
				maxWidth: '400px',
				margin: 0,
			}}
			role="alert"
			aria-live="polite"
		>
			<button
				type="button"
				className="btn-close"
				onClick={() => setIsVisible(false)}
				aria-label="Close notification"
			/>
			<strong>{isOffline ? 'Offline' : 'Terug online'}</strong>
			<br />
			{isOffline
				? 'Je bent offline. Je bezoek zal worden opgeslagen wanneer je weer online bent.'
				: 'Verbinding hersteld. Je bezoek is opgeslagen.'}
		</div>
	);
}

