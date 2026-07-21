import Link from "next/link";

export function NextActions({ children, items = [] }) {
	return (
		<section className="tap-next-actions" aria-label="Next actions">
			{children ? <p className="tap-next-actions__intro">{children}</p> : null}
			<div className="tap-next-actions__grid">
				{items.map(({ href, title, description, meta }) => (
					<Link className="tap-next-action" href={href} key={`${href}-${title}`}>
						<span className="tap-next-action__title">{title}</span>
						{description ? <span className="tap-next-action__description">{description}</span> : null}
						{meta ? <code className="tap-next-action__meta">{meta}</code> : null}
					</Link>
				))}
			</div>
		</section>
	);
}

export function Detail({ summary, children, open = false }) {
	return (
		<details className="tap-detail" open={open}>
			<summary>{summary}</summary>
			<div className="tap-detail__body">{children}</div>
		</details>
	);
}

export function Route({ method, children }) {
	return (
		<span className="tap-route">
			<span className={`tap-method tap-method--${method.toLowerCase()}`}>{method}</span>
			<code>{children}</code>
		</span>
	);
}
