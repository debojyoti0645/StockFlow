import { useEffect, useState } from "react";
import "./Inventory.css";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");

  const [error, setError] = useState("");

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchWarehouses();
  }, []);

  async function fetchInventory() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/inventory/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load inventory"
        );
      }

      setInventory(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function fetchProducts() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/products/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load products"
        );
      }

      setProducts(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function fetchWarehouses() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/warehouses/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load warehouses"
        );
      }

      setWarehouses(data);
    } catch (error) {
      setError(error.message);
    }
  }

  function getProduct(productId) {
    return products.find(
      (product) => product.id === productId
    );
  }

  function getWarehouse(warehouseId) {
    return warehouses.find(
      (warehouse) => warehouse.id === warehouseId
    );
  }

  function getAvailableQuantity(item) {
    return item.quantity - item.reserved_quantity;
  }

  function getStockStatus(item) {
    const product = getProduct(item.product_id);

    if (!product) {
      return "UNKNOWN";
    }

    if (item.quantity <= product.reorder_level) {
      return "LOW";
    }

    return "HEALTHY";
  }

  const filteredInventory = inventory.filter((item) => {
    const product = getProduct(item.product_id);
    const warehouse = getWarehouse(item.warehouse_id);

    const searchText = search.toLowerCase();

    const matchesSearch =
      (product?.name || "")
        .toLowerCase()
        .includes(searchText) ||
      (product?.sku || "")
        .toLowerCase()
        .includes(searchText) ||
      (warehouse?.name || "")
        .toLowerCase()
        .includes(searchText);

    const matchesWarehouse =
      warehouseFilter === "" ||
      String(item.warehouse_id) === warehouseFilter;

    const status = getStockStatus(item);

    const matchesStock =
      stockFilter === "ALL" ||
      status === stockFilter;

    return (
      matchesSearch &&
      matchesWarehouse &&
      matchesStock
    );
  });

  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalReserved = inventory.reduce(
    (total, item) => total + item.reserved_quantity,
    0
  );

  const totalAvailable = totalUnits - totalReserved;

  const lowStockCount = inventory.filter(
    (item) => getStockStatus(item) === "LOW"
  ).length;

  return (
    <div className="inventory-page">
      {error && (
        <div className="inventory-error">
          {error}
        </div>
      )}

      <div className="inventory-summary">

        <div className="inventory-summary-card">
          <div className="summary-label">
            Total Units
          </div>

          <div className="summary-value">
            {totalUnits.toLocaleString("en-IN")}
          </div>

          <div className="summary-description">
            Current physical stock
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="summary-label">
            Available
          </div>

          <div className="summary-value">
            {totalAvailable.toLocaleString("en-IN")}
          </div>

          <div className="summary-description">
            Stock available for use
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="summary-label">
            Reserved
          </div>

          <div className="summary-value">
            {totalReserved.toLocaleString("en-IN")}
          </div>

          <div className="summary-description">
            Stock reserved for orders
          </div>
        </div>

        <div className="inventory-summary-card low-stock-card">
          <div className="summary-label">
            Low Stock
          </div>

          <div className="summary-value">
            {lowStockCount}
          </div>

          <div className="summary-description">
            Items at or below reorder level
          </div>
        </div>

      </div>

      <div className="inventory-toolbar">

        <input
          type="text"
          placeholder="Search product, SKU or warehouse..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={warehouseFilter}
          onChange={(event) =>
            setWarehouseFilter(event.target.value)
          }
        >
          <option value="">
            All Warehouses
          </option>

          {warehouses.map((warehouse) => (
            <option
              key={warehouse.id}
              value={warehouse.id}
            >
              {warehouse.name}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(event) =>
            setStockFilter(event.target.value)
          }
        >
          <option value="ALL">
            All Stock
          </option>

          <option value="HEALTHY">
            Healthy
          </option>

          <option value="LOW">
            Low Stock
          </option>
        </select>

        <span className="inventory-count">
          {filteredInventory.length} record
          {filteredInventory.length !== 1 ? "s" : ""}
        </span>

      </div>

      <div className="inventory-table-card">

        <table className="inventory-table">

          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Warehouse</th>
              <th>Total Stock</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {filteredInventory.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="empty-row"
                >
                  No inventory records found.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {

                const product = getProduct(
                  item.product_id
                );

                const warehouse = getWarehouse(
                  item.warehouse_id
                );

                const available =
                  getAvailableQuantity(item);

                const status =
                  getStockStatus(item);

                return (
                  <tr key={item.id}>

                    <td>
                      <div className="inventory-product-name">
                        {product?.name || "Unknown Product"}
                      </div>

                      <div className="inventory-product-id">
                        Product #{item.product_id}
                      </div>
                    </td>

                    <td>
                      <span className="sku-badge">
                        {product?.sku || "—"}
                      </span>
                    </td>

                    <td>
                      <div className="warehouse-cell">
                        {warehouse?.name || "Unknown"}
                      </div>

                      {warehouse?.location && (
                        <div className="warehouse-location">
                          {warehouse.location}
                        </div>
                      )}
                    </td>

                    <td>
                      <strong>
                        {item.quantity}
                      </strong>
                    </td>

                    <td>
                      {item.reserved_quantity}
                    </td>

                    <td>
                      <strong>
                        {available}
                      </strong>
                    </td>

                    <td>
                      {product?.reorder_level ?? "—"}
                    </td>

                    <td>
                      {status === "LOW" ? (
                        <span className="stock-status low">
                          Low Stock
                        </span>
                      ) : (
                        <span className="stock-status healthy">
                          Healthy
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Inventory;