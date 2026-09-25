import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Warehouses from "./pages/Warehouses";
import PurchaseOrders from "./pages/PurchaseOrders";
import SalesOrders from "./pages/SalesOrders";
import Customers from "./pages/Customers";
import StockTransfers from "./pages/StockTransfers";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import SalesForecast from "./pages/SalesForecast";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [activePage, setActivePage] = useState("Dashboard");

  function handleLogout() {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="main-area">
        <Topbar
          activePage={activePage}
          onLogout={handleLogout}
        />

        <main className="page-content">
          {activePage === "Dashboard" && <Dashboard />}
          {activePage === "Products" && <Products />}
          {activePage === "Categories" && <Categories />}
          {activePage === "Suppliers" && <Suppliers />}
          {activePage === "Warehouses" && <Warehouses />}
          {activePage === "Inventory" && <Inventory />}
          {activePage === "Purchase Orders" && <PurchaseOrders />}
          {activePage === "Sales Orders" && <SalesOrders />}
          {activePage === "Customers" && <Customers />}
          {activePage === "Stock Transfers" && <StockTransfers />}
          {activePage === "Notifications" && <Notifications />}
          {activePage === "Audit Logs" && <AuditLogs />}
          {activePage === "Sales Forecast" && <SalesForecast />}
        </main>
      </div>
    </div>
  );
}

export default App;