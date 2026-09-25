import { useEffect, useState } from "react";
import "./StockTransfers.css";

const API_URL = "http://127.0.0.1:8000";

function StockTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [form, setForm] = useState({
    transfer_number: "",
    source_warehouse_id: "",
    destination_warehouse_id: "",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
    },
  ]);

  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [transferResponse, warehouseResponse, productResponse] =
        await Promise.all([
          fetch(`${API_URL}/stock-transfers/`, {
            headers,
          }),
          fetch(`${API_URL}/warehouses/`, {
            headers,
          }),
          fetch(`${API_URL}/products/`, {
            headers,
          }),
        ]);

      if (!transferResponse.ok) {
        throw new Error("Failed to load stock transfers");
      }

      if (!warehouseResponse.ok) {
        throw new Error("Failed to load warehouses");
      }

      if (!productResponse.ok) {
        throw new Error("Failed to load products");
      }

      const transferData = await transferResponse.json();
      const warehouseData = await warehouseResponse.json();
      const productData = await productResponse.json();

      setTransfers(transferData);
      setWarehouses(warehouseData);
      setProducts(productData);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function openModal() {
    setForm({
      transfer_number: `TR-${String(transfers.length + 1).padStart(3, "0")}`,
      source_warehouse_id: "",
      destination_warehouse_id: "",
      notes: "",
    });

    setItems([
      {
        product_id: "",
        quantity: 1,
      },
    ]);

    setMessage("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleItemChange(index, field, value) {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setItems(updatedItems);
  }

  function addItem() {
    setItems([
      ...items,
      {
        product_id: "",
        quantity: 1,
      },
    ]);
  }

  function removeItem(index) {
    if (items.length === 1) {
      return;
    }

    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  async function createTransfer(event) {
    event.preventDefault();

    if (
      !form.source_warehouse_id ||
      !form.destination_warehouse_id
    ) {
      setMessage("Please select both warehouses.");
      return;
    }

    if (
      form.source_warehouse_id === form.destination_warehouse_id
    ) {
      setMessage("Source and destination warehouses must be different.");
      return;
    }

    const validItems = items.filter(
      (item) => item.product_id && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      setMessage("Please add at least one product.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/stock-transfers/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          transfer_number: form.transfer_number,
          source_warehouse_id: Number(form.source_warehouse_id),
          destination_warehouse_id: Number(
            form.destination_warehouse_id
          ),
          notes: form.notes || null,
          items: validItems.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create transfer");
      }

      setShowModal(false);
      setMessage("Stock transfer created successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function completeTransfer(id) {
    const confirmed = window.confirm(
      "Complete this stock transfer? Inventory will be moved between warehouses."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/stock-transfers/${id}/complete`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to complete transfer");
      }

      setMessage("Stock transfer completed successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function getWarehouseName(id) {
    const warehouse = warehouses.find(
      (item) => item.id === id
    );

    return warehouse ? warehouse.name : `Warehouse #${id}`;
  }

  function getProductName(id) {
    const product = products.find(
      (item) => item.id === id
    );

    return product ? product.name : `Product #${id}`;
  }

  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch =
      transfer.transfer_number
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      getWarehouseName(transfer.source_warehouse_id)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      getWarehouseName(transfer.destination_warehouse_id)
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      transfer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="stock-transfers-page">
      <div className="page-header">
        <div>
          <h1>Stock Transfers</h1>
          <p>
            Move inventory between warehouses and track transfer status.
          </p>
        </div>

        <button className="primary-button" onClick={openModal}>
          + New Transfer
        </button>
      </div>

      {message && (
        <div className="page-message">
          {message}
        </div>
      )}

      <div className="transfer-toolbar">
        <input
          type="text"
          placeholder="Search transfer or warehouse..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="transfer-table-card">
        <table className="transfer-table">
          <thead>
            <tr>
              <th>Transfer No.</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Items</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  No stock transfers found.
                </td>
              </tr>
            ) : (
              filteredTransfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td>
                    <strong>{transfer.transfer_number}</strong>
                  </td>

                  <td>
                    {getWarehouseName(
                      transfer.source_warehouse_id
                    )}
                  </td>

                  <td>
                    {getWarehouseName(
                      transfer.destination_warehouse_id
                    )}
                  </td>

                  <td>
                    {transfer.items?.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="transfer-item"
                      >
                        {getProductName(item.product_id)}
                        <span>
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </td>

                  <td>
                    {transfer.notes || "-"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        transfer.status === "COMPLETED"
                          ? "status-completed"
                          : "status-pending"
                      }`}
                    >
                      {transfer.status}
                    </span>
                  </td>

                  <td>
                    {transfer.transfer_date
                      ? new Date(
                          transfer.transfer_date
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {transfer.status !== "COMPLETED" ? (
                      <button
                        className="complete-button"
                        onClick={() =>
                          completeTransfer(transfer.id)
                        }
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="completed-text">
                        ✓ Done
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="transfer-modal">
            <div className="modal-header">
              <div>
                <h2>Create Stock Transfer</h2>
                <p>
                  Move products from one warehouse to another.
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={createTransfer}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Transfer Number</label>
                  <input
                    name="transfer_number"
                    value={form.transfer_number}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Source Warehouse</label>

                  <select
                    name="source_warehouse_id"
                    value={form.source_warehouse_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">
                      Select source
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
                </div>

                <div className="form-group">
                  <label>Destination Warehouse</label>

                  <select
                    name="destination_warehouse_id"
                    value={form.destination_warehouse_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">
                      Select destination
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
                </div>

                <div className="form-group">
                  <label>Notes</label>

                  <input
                    name="notes"
                    placeholder="Optional notes"
                    value={form.notes}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="items-section">
                <div className="items-header">
                  <h3>Transfer Items</h3>

                  <button
                    type="button"
                    className="add-item-button"
                    onClick={addItem}
                  >
                    + Add Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div
                    className="item-row"
                    key={index}
                  >
                    <select
                      value={item.product_id}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "product_id",
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">
                        Select product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "quantity",
                          event.target.value
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {message && (
                <div className="modal-message">
                  {message}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Create Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockTransfers;