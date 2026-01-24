"use client";
import { useLoading } from '../../hooks/use-loading';
import React from 'react';

export default function SamplePage() {
	const [isLoading, withLoading] = useLoading();

	const handleClick = () =>
		withLoading(async () => {
			// Simulate async work
			await new Promise((resolve) => setTimeout(resolve, 2000));
			alert('Done!');
		});

	return (
		<div style={{ padding: 32 }}>
            <h1 style={{ fontSize: 24, marginBottom: 16 }}>Sample Page with useLoading Hook</h1>
			<button onClick={handleClick} disabled={isLoading} style={{ padding: '8px 16px', fontSize: 16 }}>
				{isLoading ? 'Loading...' : 'Click Me'}
			</button>
		</div>
	);
}
