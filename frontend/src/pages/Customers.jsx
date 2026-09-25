import { useEffect, useState } from "react";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/customers/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load customers"
        );
      }

      setCustomers(data);
    } catch (error) {
      setError(error.message);
    }
  }

  function openAddForm() {
    setEditingCustomer(null);

    setName("");
    setEmail("");
    setPhone("");
    setAddress("");

    setError("");
    setSuccess("");

    setShowForm(true);
  }

  function openEditForm(customer) {
    setEditingCustomer(customer);

    setName(customer.name || "");
    setEmail(customer.email || "");
    setPhone(customer.phone || "");
    setAddress(customer.address || "");

    setError("");
    setSuccess("");

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCustomer(null);

    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
  }

  async function saveCustomer(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    const token = localStorage.getItem("access_token");

    const payload = {
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
    };

    const url = editingCustomer
      ? `http://127.0.0.1:8000/customers/${editingCustomer.id}`
      : "http://127.0.0.1:8000/customers/";

    const method = editingCustomer ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to save customer"
        );
      }

      setSuccess(
        editingCustomer
          ? "Customer updated successfully."
          : "Customer created successfully."
      );

      closeForm();
      fetchCustomers();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteCustomer(customerId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/customers/${customerId}`,
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
          data.detail || "Failed to delete customer"
        );
      }

      setSuccess("Customer deleted successfully.");

      fetchCustomers();
    } catch (error) {
      setError(error.message);
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.name
        .toLowerCase()
        .includes(searchText) ||
      (customer.email || "")
        .toLowerCase()
        .includes(searchText) ||
      (customer.phone || "")
        .toLowerCase()
        .includes(searchText) ||
      (customer.address || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div className="customers-page">

      <div className="page-heading">
        <div>
          <h2>Customers</h2>
          <p>
            Manage customer information and contact details.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Customer
        </button>
      </div>

      {error && (
        <div className="customer-error">
          {error}
        </div>
      )}

      {success && (
        <div className="customer-success">
          {success}
        </div>
      )}

      <div className="customer-toolbar">

        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <span className="customer-count">
          {filteredCustomers.length} customer
          {filteredCustomers.length !== 1 ? "s" : ""}
        </span>

      </div>

      <div className="customer-table-card">

        <table className="customer-table">

          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="empty-row"
                >
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (

                <tr key={customer.id}>

                  <td>
                    <div className="customer-name">
                      {customer.name}
                    </div>

                    <div className="customer-id">
                      Customer #{customer.id}
                    </div>
                  </td>

                  <td>
                    {customer.email || "—"}
                  </td>

                  <td>
                    {customer.phone || "—"}
                  </td>

                  <td>
                    {customer.address || "—"}
                  </td>

                  <td>

                    <div className="customer-actions">

                      <button
                        className="edit-button"
                        onClick={() =>
                          openEditForm(customer)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteCustomer(customer.id)
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

          <div className="customer-modal">

            <div className="modal-header">

              <div>
                <h3>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h3>

                <p>
                  {editingCustomer
                    ? "Update customer information."
                    : "Enter customer information."}
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={saveCustomer}>

              <div className="form-grid">

                <div className="form-group full-width">

                  <label>
                    Customer Name
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Rahul Enterprise"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                  />

                </div>

                <div className="form-group full-width">

                  <label>
                    Address
                  </label>

                  <textarea
                    placeholder="Customer address"
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                  />

                </div>

              </div>

              <div className="modal-footer">

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
                  {editingCustomer
                    ? "Update Customer"
                    : "Add Customer"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Customers;