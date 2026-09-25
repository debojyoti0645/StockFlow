import { useEffect, useState } from "react";
import "./Warehouses.css";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    manager_name: "",
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

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

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  function openAddForm() {
    setEditingWarehouse(null);

    setForm({
      name: "",
      location: "",
      manager_name: "",
    });

    setShowForm(true);
    setError("");
  }

  function openEditForm(warehouse) {
    setEditingWarehouse(warehouse);

    setForm({
      name: warehouse.name,
      location: warehouse.location || "",
      manager_name: warehouse.manager_name || "",
    });

    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingWarehouse(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    const warehouseData = {
      name: form.name,
      location: form.location || null,
      manager_name: form.manager_name || null,
    };

    try {
      const url = editingWarehouse
        ? `http://127.0.0.1:8000/warehouses/${editingWarehouse.id}`
        : "http://127.0.0.1:8000/warehouses/";

      const method = editingWarehouse ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(warehouseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save warehouse"
        );
      }

      closeForm();
      fetchWarehouses();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteWarehouse(warehouseId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this warehouse?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/warehouses/${warehouseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to delete warehouse"
        );
      }

      fetchWarehouses();
    } catch (error) {
      setError(error.message);
    }
  }

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const searchText = search.toLowerCase();

    return (
      warehouse.name.toLowerCase().includes(searchText) ||
      (warehouse.location || "")
        .toLowerCase()
        .includes(searchText) ||
      (warehouse.manager_name || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div className="warehouses-page">
      <div className="page-heading">
        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Warehouse
        </button>
      </div>

      {error && (
        <div className="warehouses-error">
          {error}
        </div>
      )}

      <div className="warehouses-toolbar">
        <input
          type="text"
          placeholder="Search by warehouse, location or manager..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span>
          {filteredWarehouses.length} warehouse
          {filteredWarehouses.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="warehouses-table-card">
        <table className="warehouses-table">

          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Location</th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredWarehouses.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="empty-row"
                >
                  No warehouses found.
                </td>
              </tr>
            ) : (
              filteredWarehouses.map((warehouse) => (
                <tr key={warehouse.id}>

                  <td>
                    <div className="warehouse-name">
                      {warehouse.name}
                    </div>

                    <div className="warehouse-id">
                      Warehouse #{warehouse.id}
                    </div>
                  </td>

                  <td>
                    <div className="warehouse-location">
                      {warehouse.location || "—"}
                    </div>
                  </td>

                  <td>
                    <div className="warehouse-manager">
                      {warehouse.manager_name || "—"}
                    </div>
                  </td>

                  <td>
                    <div className="action-buttons">

                      <button
                        className="edit-button"
                        onClick={() =>
                          openEditForm(warehouse)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteWarehouse(warehouse.id)
                        }
                      >
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">

          <div className="warehouse-modal">

            <div className="modal-header">

              <div>
                <h3>
                  {editingWarehouse
                    ? "Edit Warehouse"
                    : "Add Warehouse"}
                </h3>

                <p>
                  Enter the warehouse information below.
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-field full-width">
                  <label>Warehouse Name</label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Main Warehouse"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Location</label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Kolkata, West Bengal"
                  />
                </div>

                <div className="form-field full-width">
                  <label>Manager Name</label>

                  <input
                    type="text"
                    name="manager_name"
                    value={form.manager_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Das"
                  />
                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingWarehouse
                    ? "Update Warehouse"
                    : "Create Warehouse"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Warehouses;