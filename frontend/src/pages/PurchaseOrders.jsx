import { useEffect, useState } from "react";
import "./PurchaseOrders.css";

function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [poNumber, setPoNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
      unit_price: "",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchWarehouses();
    fetchProducts();
  }, []);

  async function fetchOrders() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/purchase-orders/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load purchase orders"
        );
      }

      setOrders(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function fetchSuppliers() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/suppliers/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load suppliers"
        );
      }

      setSuppliers(data);
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

  function getSupplierName(supplierId) {
    const supplier = suppliers.find(
      (item) => item.id === supplierId
    );

    return supplier ? supplier.name : "Unknown Supplier";
  }

  function getWarehouseName(warehouseId) {
    const warehouse = warehouses.find(
      (item) => item.id === warehouseId
    );

    return warehouse ? warehouse.name : "Unknown Warehouse";
  }

  function getProductName(productId) {
    const product = products.find(
      (item) => item.id === productId
    );

    return product ? product.name : "Unknown Product";
  }

  function addItem() {
    setItems([
      ...items,
      {
        product_id: "",
        quantity: 1,
        unit_price: "",
      },
    ]);
  }

  function removeItem(index) {
    if (items.length === 1) {
      return;
    }

    const updatedItems = items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    setItems(updatedItems);
  }

  function updateItem(index, field, value) {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    setItems(updatedItems);
  }

  function getFormTotal() {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;

      return total + quantity * price;
    }, 0);
  }

  function resetForm() {
    setPoNumber("");
    setSupplierId("");
    setWarehouseId("");

    setItems([
      {
        product_id: "",
        quantity: 1,
        unit_price: "",
      },
    ]);

    setShowForm(false);
  }

  async function createPurchaseOrder(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!poNumber.trim()) {
      setError("Please enter a PO number.");
      return;
    }

    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }

    if (!warehouseId) {
      setError("Please select a warehouse.");
      return;
    }

    for (const item of items) {
      if (!item.product_id) {
        setError("Please select a product for every item.");
        return;
      }

      if (Number(item.quantity) <= 0) {
        setError("Quantity must be greater than 0.");
        return;
      }

      if (Number(item.unit_price) <= 0) {
        setError("Unit price must be greater than 0.");
        return;
      }
    }

    const token = localStorage.getItem("access_token");

    const payload = {
      po_number: poNumber,
      supplier_id: Number(supplierId),
      warehouse_id: Number(warehouseId),
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/purchase-orders/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create purchase order"
        );
      }

      setSuccess("Purchase order created successfully.");

      resetForm();
      fetchOrders();
    } catch (error) {
      setError(error.message);
    }
  }

  async function receivePurchaseOrder(orderId) {
    const confirmed = window.confirm(
      "Receive this purchase order? Inventory will be increased automatically."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/purchase-orders/${orderId}/receive`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to receive purchase order"
        );
      }

      setSuccess(
        "Purchase order received. Inventory has been updated."
      );

      fetchOrders();
    } catch (error) {
      setError(error.message);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      order.po_number
        .toLowerCase()
        .includes(searchText) ||
      getSupplierName(order.supplier_id)
        .toLowerCase()
        .includes(searchText) ||
      getWarehouseName(order.warehouse_id)
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="purchase-orders-page">

      <div className="page-heading">
        <div>
          <h2>Purchase Orders</h2>
          <p>
            Create and manage supplier purchase orders.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
        >
          + Create Purchase Order
        </button>
      </div>

      {error && (
        <div className="purchase-error">
          {error}
        </div>
      )}

      {success && (
        <div className="purchase-success">
          {success}
        </div>
      )}

      <div className="purchase-toolbar">

        <input
          type="text"
          placeholder="Search PO, supplier or warehouse..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="ALL">
            All Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="RECEIVED">
            Received
          </option>
        </select>

        <span className="purchase-count">
          {filteredOrders.length} order
          {filteredOrders.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="purchase-table-card">

        <table className="purchase-table">

          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="empty-row"
                >
                  No purchase orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (

                <tr key={order.id}>

                  <td>
                    <div className="po-number">
                      {order.po_number}
                    </div>

                    <div className="po-id">
                      Order #{order.id}
                    </div>
                  </td>

                  <td>
                    {getSupplierName(
                      order.supplier_id
                    )}
                  </td>

                  <td>
                    {getWarehouseName(
                      order.warehouse_id
                    )}
                  </td>

                  <td>
                    <div className="items-count">
                      {order.items?.length || 0}
                    </div>

                    <div className="items-preview">

                      {order.items?.slice(0, 2).map(
                        (item) => (
                          <div key={item.id}>
                            {getProductName(
                              item.product_id
                            )} × {item.quantity}
                          </div>
                        )
                      )}

                      {order.items?.length > 2 && (
                        <div>
                          +{order.items.length - 2} more
                        </div>
                      )}

                    </div>
                  </td>

                  <td>
                    <strong>
                      ₹
                      {Number(
                        order.total_amount
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </td>

                  <td>
                    {order.status === "RECEIVED" ? (
                      <span className="po-status received">
                        Received
                      </span>
                    ) : (
                      <span className="po-status pending">
                        Pending
                      </span>
                    )}
                  </td>

                  <td>
                    {new Date(
                      order.order_date
                    ).toLocaleDateString("en-IN")}
                  </td>

                  <td>

                    {order.status === "PENDING" ? (
                      <button
                        className="receive-button"
                        onClick={() =>
                          receivePurchaseOrder(
                            order.id
                          )
                        }
                      >
                        Receive
                      </button>
                    ) : (
                      <span className="completed-text">
                        Completed
                      </span>
                    )}

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

      {showForm && (
        <div className="modal-overlay">

          <div className="purchase-modal">

            <div className="modal-header">

              <div>
                <h3>Create Purchase Order</h3>
                <p>
                  Add supplier and purchase items.
                </p>
              </div>

              <button
                className="close-button"
                onClick={resetForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={createPurchaseOrder}>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    PO Number
                  </label>

                  <input
                    type="text"
                    placeholder="Example: PO-002"
                    value={poNumber}
                    onChange={(event) =>
                      setPoNumber(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Supplier
                  </label>

                  <select
                    value={supplierId}
                    onChange={(event) =>
                      setSupplierId(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Supplier
                    </option>

                    {suppliers.map(
                      (supplier) => (
                        <option
                          key={supplier.id}
                          value={supplier.id}
                        >
                          {supplier.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Warehouse
                  </label>

                  <select
                    value={warehouseId}
                    onChange={(event) =>
                      setWarehouseId(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Warehouse
                    </option>

                    {warehouses.map(
                      (warehouse) => (
                        <option
                          key={warehouse.id}
                          value={warehouse.id}
                        >
                          {warehouse.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              <div className="items-section">

                <div className="items-section-header">

                  <div>
                    <h4>Order Items</h4>
                    <p>
                      Add products to this purchase order.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="add-item-button"
                    onClick={addItem}
                  >
                    + Add Item
                  </button>

                </div>

                <div className="item-list">

                  {items.map((item, index) => (

                    <div
                      className="item-row"
                      key={index}
                    >

                      <div className="item-field product-field">

                        <label>
                          Product
                        </label>

                        <select
                          value={item.product_id}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "product_id",
                              event.target.value
                            )
                          }
                        >
                          <option value="">
                            Select Product
                          </option>

                          {products.map(
                            (product) => (
                              <option
                                key={product.id}
                                value={product.id}
                              >
                                {product.name} (
                                {product.sku})
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      <div className="item-field">

                        <label>
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "quantity",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      <div className="item-field">

                        <label>
                          Unit Price
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="₹ 0.00"
                          value={item.unit_price}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "unit_price",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      <div className="item-subtotal">

                        <label>
                          Subtotal
                        </label>

                        <strong>
                          ₹
                          {(
                            (Number(item.quantity) || 0) *
                            (Number(item.unit_price) || 0)
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>

                      </div>

                      <button
                        type="button"
                        className="remove-item-button"
                        onClick={() =>
                          removeItem(index)
                        }
                        disabled={items.length === 1}
                      >
                        ×
                      </button>

                    </div>

                  ))}

                </div>

              </div>

              <div className="modal-footer">

                <div className="form-total">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {getFormTotal().toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </strong>

                </div>

                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Create Purchase Order
                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default PurchaseOrders;