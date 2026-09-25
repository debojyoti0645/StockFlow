import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/dashboard/summary",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load dashboard");
      }

      setSummary(data);
    } catch (error) {
      setError(error.message);
    }
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  const cards = [
    {
      title: "Total Products",
      value: summary.total_products,
      icon: "▣",
      description: "Products in catalog",
    },
    {
      title: "Inventory Units",
      value: summary.total_inventory_units,
      icon: "▤",
      description: "Units currently in stock",
    },
    {
      title: "Suppliers",
      value: summary.total_suppliers,
      icon: "♧",
      description: "Active suppliers",
    },
    {
      title: "Warehouses",
      value: summary.total_warehouses,
      icon: "⌂",
      description: "Storage locations",
    },
    {
      title: "Purchase Orders",
      value: summary.total_purchase_orders,
      icon: "🛒",
      description: "Total purchase orders",
    },
    {
      title: "Sales Orders",
      value: summary.total_sales_orders,
      icon: "💰",
      description: "Total sales orders",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-toolbar">
        <button
          className="refresh-button"
          onClick={fetchDashboard}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.title}>
            <div className="stat-card-top">
              <div className="stat-icon">
                {card.icon}
              </div>
            </div>

            <div className="stat-value">
              {card.value}
            </div>

            <div className="stat-title">
              {card.title}
            </div>

            <div className="stat-description">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Inventory Status</h3>
              <p>Current stock overview</p>
            </div>
          </div>

          <div className="inventory-status">
            <div className="inventory-number">
              {summary.total_inventory_units}
            </div>

            <div>
              <strong>Total Inventory Units</strong>
              <p>Units currently recorded across warehouses.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Stock Alerts</h3>
              <p>Products requiring attention</p>
            </div>
          </div>

          <div className="alert-content">
            <div className="alert-number">
              {summary.low_stock_products}
            </div>

            <div>
              <strong>Low Stock Products</strong>

              {summary.low_stock_products > 0 ? (
                <p>Some products need to be reordered.</p>
              ) : (
                <p>All products are above their reorder levels.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="quick-overview">
        <div className="overview-item">
          <span>Categories</span>
          <strong>{summary.total_categories}</strong>
        </div>

        <div className="overview-item">
          <span>Customers</span>
          <strong>{summary.total_customers}</strong>
        </div>

        <div className="overview-item">
          <span>Warehouses</span>
          <strong>{summary.total_warehouses}</strong>
        </div>

        <div className="overview-item">
          <span>Suppliers</span>
          <strong>{summary.total_suppliers}</strong>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;