import "./Topbar.css";

function Topbar({ activePage, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <h1>{activePage}</h1>
        <p>Manage your inventory and operations</p>
      </div>

      <div className="topbar-right">
        <button className="notification-button">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <div className="user-avatar">
            A
          </div>

          <div className="user-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={onLogout}
          title="Logout"
        >
          ↪
        </button>
      </div>
    </header>
  );
}

export default Topbar;