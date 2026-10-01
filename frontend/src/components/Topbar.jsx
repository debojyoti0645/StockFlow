import "./Topbar.css";

function Topbar({ activePage, onLogout, onNotificationsClick }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{activePage}</h1>
        <p>Manage your inventory and operations</p>
      </div>

      <div className="topbar-right">
        <button
          className="notification-button"
          onClick={onNotificationsClick}
          title="View notifications"
          type="button"
        >
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <div className="user-avatar">A</div>

          <div className="user-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
        </div>

        <button className="logout-button" onClick={onLogout} title="Logout">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logout-icon"
            aria-label="Logout"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
