import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useFinance } from "../finance/finance-context";
import { CurrencyBadgeList, StatusPill } from "./ui";

const navItems = [
  { to: "/overview", label: "Overview", eyebrow: "Home" },
  { to: "/cashflow", label: "Cashflow", eyebrow: "Entries" },
  { to: "/accounts", label: "Accounts", eyebrow: "Wallets" },
  { to: "/planning", label: "Planning", eyebrow: "Budgets" },
  { to: "/liabilities", label: "Liabilities", eyebrow: "Debt" }
];

const routeMeta = {
  "/overview": {
    kicker: "Command center",
    title: "Moliyaviy pulse bir qarashda",
    subtitle: "Balans, trend, kategoriya va reja-real farqini bitta ishchi panelga yig'adi."
  },
  "/cashflow": {
    kicker: "Operations",
    title: "Kirim, chiqim va transfer oqimi",
    subtitle: "Kunlik transaction workflow va valyuta o'tkazmalarini operatsion sahifaga ajratadi."
  },
  "/accounts": {
    kicker: "Portfolio",
    title: "Hisoblar va kartalar arxitekturasi",
    subtitle: "Har bir wallet, card va savings hisobini alohida kuzatish uchun."
  },
  "/planning": {
    kicker: "Planning",
    title: "Byudjet, reja va signal",
    subtitle: "Oy kesimida target va limitlarni nazorat qiladi, oddiy rule-based insight beradi."
  },
  "/liabilities": {
    kicker: "Obligations",
    title: "Qarzlar va haqdorliklar",
    subtitle: "OPEN/CLOSED holatidagi barcha majburiyatlarni alohida boshqarish uchun."
  }
};

export default function AppShell() {
  const { state, options, actions, derived } = useFinance();
  const location = useLocation();
  const meta = routeMeta[location.pathname] ?? routeMeta["/overview"];
  const topExpense = state.dashboard.categoryStats.find((item) => item.type === "EXPENSE");
  const topIncome = state.dashboard.categoryStats.find((item) => item.type === "INCOME");
  const budgetBreaches = state.dashboard.budgetComparisons.filter(
    (item) => item.type === "EXPENSE_LIMIT" && Number(item.delta) > 0
  );

  return (
    <div className="shell-layout">
      <div className="shell-layout__backdrop" />

      <aside className="shell-sidebar">
        <div className="brand-lockup">
          <span className="brand-lockup__chip">CBU</span>
          <div>
            <strong>Xarajat Studio</strong>
            <p>Fintech MVP cockpit</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
            >
              <span>{item.eyebrow}</span>
              <strong>{item.label}</strong>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-panel">
          <div className="sidebar-panel__head">
            <span>Joriy balans</span>
            <StatusPill tone="positive">{state.dashboard.accounts.length} account</StatusPill>
          </div>
          <CurrencyBadgeList
            items={state.dashboard.balanceTotals}
            emptyLabel="Balans mavjud emas"
          />
        </div>

        <div className="sidebar-panel">
          <div className="sidebar-panel__head">
            <span>Qisqa holat</span>
            <StatusPill tone={derived.openDebts.length ? "warning" : "neutral"}>
              {derived.openDebts.length} open debt
            </StatusPill>
          </div>
          <ul className="sidebar-list">
            <li>
              <span>Oy</span>
              <strong>{state.selectedMonth}</strong>
            </li>
            <li>
              <span>Granularity</span>
              <strong>{state.granularity}</strong>
            </li>
            <li>
              <span>Transactions</span>
              <strong>{state.entries.length}</strong>
            </li>
          </ul>
        </div>
      </aside>

      <div className="shell-main">
        <nav className="workspace-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `workspace-nav__link ${isActive ? "is-active" : ""}`}
            >
              <span>{item.eyebrow}</span>
              <strong>{item.label}</strong>
            </NavLink>
          ))}
        </nav>

        <header className="workspace-header">
          <div>
            <p className="workspace-header__kicker">{meta.kicker}</p>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>

          <div className="workspace-header__controls">
            <label>
              Tanlangan oy
              <input
                type="month"
                value={state.selectedMonth}
                onChange={(event) => actions.updateSelectedMonth(event.target.value)}
              />
            </label>

            <label>
              Trend kesimi
              <select
                value={state.granularity}
                onChange={(event) => actions.setGranularity(event.target.value)}
              >
                {options.granularityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button className="secondary-button" type="button" onClick={actions.refresh}>
              Sync
            </button>
          </div>
        </header>

        <section className="workspace-pulse">
          <article className="pulse-card">
            <span>Top expense category</span>
            <strong>{topExpense ? topExpense.category : "No expense"}</strong>
            <small>{topExpense ? `${topExpense.currency} flow` : "Tracking boshlanmagan"}</small>
          </article>
          <article className="pulse-card">
            <span>Top income source</span>
            <strong>{topIncome ? topIncome.category : "No income"}</strong>
            <small>{topIncome ? `${topIncome.currency} flow` : "Tracking boshlanmagan"}</small>
          </article>
          <article className="pulse-card">
            <span>Budget health</span>
            <strong>{budgetBreaches.length ? `${budgetBreaches.length} alert` : "Stable"}</strong>
            <small>{budgetBreaches.length ? "Expense limitlar kuzatuvda" : "Limitlar ichida"}</small>
          </article>
          <article className="pulse-card">
            <span>Operations</span>
            <strong>{state.entries.length + derived.visibleTransfers.length}</strong>
            <small>{state.selectedMonth} uchun yozuvlar</small>
          </article>
        </section>

        {state.error ? <div className="alert-banner">{state.error}</div> : null}

        <Outlet />
      </div>

      {state.loading ? <div className="loading-overlay">Yuklanmoqda...</div> : null}
    </div>
  );
}
