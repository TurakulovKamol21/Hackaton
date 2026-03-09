import { compactMoney } from "../lib/finance-utils";

export function HeroBanner({ kicker, title, subtitle, aside, children, className = "" }) {
  return (
    <section className={`hero-banner ${className}`.trim()}>
      <div className="hero-banner__copy">
        {kicker ? <p className="hero-banner__kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {aside ? <div className="hero-banner__aside">{aside}</div> : null}
      {children ? <div className="hero-banner__foot">{children}</div> : null}
    </section>
  );
}

export function SurfaceSection({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`surface-panel ${className}`.trim()}>
      {(title || subtitle || actions) ? (
        <div className="surface-panel__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="surface-panel__actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MetricTile({ label, value, caption, tone = "neutral" }) {
  return (
    <article className={`metric-tile metric-tile--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {caption ? <small>{caption}</small> : null}
    </article>
  );
}

export function CurrencyBadgeList({ items, emptyLabel, tone = "neutral" }) {
  if (!items.length) {
    return <div className="empty-inline">{emptyLabel}</div>;
  }

  return (
    <div className="currency-badge-list">
      {items.map((item) => (
        <div key={`${item.currency}-${item.amount}`} className={`currency-badge currency-badge--${tone}`}>
          <span>{item.currency}</span>
          <strong>{compactMoney(item.amount, item.currency)}</strong>
        </div>
      ))}
    </div>
  );
}

export function StatusPill({ children, tone = "neutral" }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

export function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export function SupportCard({
  eyebrow,
  title,
  text,
  items = [],
  tone = "accent",
  children
}) {
  return (
    <article className={`support-card support-card--${tone}`}>
      {eyebrow ? <span className="support-card__eyebrow">{eyebrow}</span> : null}
      <strong>{title}</strong>
      {text ? <p>{text}</p> : null}
      {items.length ? (
        <ul className="support-card__list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </article>
  );
}

export function KeyValueList({ items }) {
  return (
    <div className="key-value-list">
      {items.map((item) => (
        <div key={item.label} className="key-value-list__row">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
