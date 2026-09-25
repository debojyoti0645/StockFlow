import { useEffect, useState } from "react";
import "./Suppliers.css";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

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

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  function openAddForm() {
    setEditingSupplier(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setShowForm(true);
    setError("");
  }

  function openEditForm(supplier) {
    setEditingSupplier(supplier);

    setForm({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });

    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingSupplier(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    const supplierData = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
    };

    try {
      const url = editingSupplier
        ? `http://127.0.0.1:8000/suppliers/${editingSupplier.id}`
        : "http://127.0.0.1:8000/suppliers/";

      const method = editingSupplier ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(supplierData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save supplier"
        );
      }

      closeForm();
      fetchSuppliers();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteSupplier(supplierId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/suppliers/${supplierId}`,
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
          data.detail || "Unable to delete supplier"
        );
      }

      fetchSuppliers();
    } catch (error) {
      setError(error.message);
    }
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchText = search.toLowerCase();

    return (
      supplier.name.toLowerCase().includes(searchText) ||
      (supplier.email || "")
        .toLowerCase()
        .includes(searchText) ||
      (supplier.phone || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div className="suppliers-page">
      <div className="page-heading">
        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Supplier
        </button>
      </div>

      {error && (
        <div className="suppliers-error">
          {error}
        </div>
      )}

      <div className="suppliers-toolbar">
        <input
          type="text"
          placeholder="Search by supplier, email or phone..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span>
          {filteredSuppliers.length} supplier
          {filteredSuppliers.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="suppliers-table-card">
        <table className="suppliers-table">

          <thead>
            <tr>
              <th>Supplier</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredSuppliers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="empty-row"
                >
                  No suppliers found.
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>

                  <td>
                    <div className="supplier-name">
                      {supplier.name}
                    </div>

                    <div className="supplier-id">
                      Supplier #{supplier.id}
                    </div>
                  </td>

                  <td>
                    {supplier.email || "—"}
                  </td>

                  <td>
                    {supplier.phone || "—"}
                  </td>

                  <td>
                    <div className="supplier-address">
                      {supplier.address || "—"}
                    </div>
                  </td>

                  <td>
                    <div className="action-buttons">

                      <button
                        className="edit-button"
                        onClick={() =>
                          openEditForm(supplier)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteSupplier(supplier.id)
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

          <div className="supplier-modal">

            <div className="modal-header">

              <div>
                <h3>
                  {editingSupplier
                    ? "Edit Supplier"
                    : "Add Supplier"}
                </h3>

                <p>
                  Enter the supplier information below.
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
                  <label>Supplier Name</label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. TechSource India"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="supplier@example.com"
                  />
                </div>

                <div className="form-field">
                  <label>Phone</label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                  />
                </div>

                <div className="form-field full-width">
                  <label>Address</label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Enter supplier address"
                    rows="3"
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
                  {editingSupplier
                    ? "Update Supplier"
                    : "Create Supplier"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Suppliers;