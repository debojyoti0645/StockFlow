import "./Sidebar.css";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Products", icon: "▣" },
    { name: "Categories", icon: "◈" },
    { name: "Suppliers", icon: "♧" },
    { name: "Warehouses", icon: "⌂" },
    { name: "Inventory", icon: "▤" },
    { name: "Purchase Orders", icon: "🛒" },
    { name: "Sales Orders", icon: "💰" },
    { name: "Customers", icon: "♙" },
    { name: "Stock Transfers", icon: "⇄" },
    { name: "Notifications", icon: "♢" },
    { name: "Audit Logs", icon: "◫" },
    { name: "Sales Forecast", icon: "⌁" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">SF</div>

        <div className="sidebar-logo-text">
          <h2>StockFlow</h2>
          <span>Inventory System</span>
        </div>
      </div>

      <div className="sidebar-section-title">
        MAIN MENU
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`sidebar-item ${
              activePage === item.name ? "active" : ""
            }`}
            onClick={() => setActivePage(item.name)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-help">
          <div className="help-icon">?</div>

          <div>
            <strong>Need Help?</strong>
            <span>Contact administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;