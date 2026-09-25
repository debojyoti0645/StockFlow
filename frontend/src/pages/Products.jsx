import { useEffect, useState } from "react";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    reorder_level: "",
    category_id: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/products/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load products");
      }

      setProducts(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function fetchCategories() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/categories/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load categories");
      }

      setCategories(data);
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
    setEditingProduct(null);

    setForm({
      name: "",
      description: "",
      price: "",
      reorder_level: "",
      category_id: "",
    });

    setShowForm(true);
    setError("");
  }

  function openEditForm(product) {
    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      reorder_level: product.reorder_level,
      category_id: product.category_id,
    });

    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    const productData = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      reorder_level: Number(form.reorder_level),
      category_id: Number(form.category_id),
    };

    try {
      const url = editingProduct
        ? `http://127.0.0.1:8000/products/${editingProduct.id}`
        : "http://127.0.0.1:8000/products/";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to save product");
      }

      closeForm();
      fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to delete product");
      }

      fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  }

  function getCategoryName(categoryId) {
    const category = categories.find((item) => item.id === categoryId);

    return category ? category.name : "Unknown";
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(searchText) ||
      product.sku.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <h2>Products</h2>
          <p>Manage your product catalog and pricing.</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          + Add Product
        </button>
      </div>

      {error && <div className="products-error">{error}</div>}

      <div className="products-toolbar">
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span>
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="products-table-card">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Reorder Level</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-name">{product.name}</div>

                    <div className="product-description">
                      {product.description || "No description"}
                    </div>
                  </td>

                  <td>
                    <span className="sku-badge">{product.sku}</span>
                  </td>

                  <td>{getCategoryName(product.category_id)}</td>

                  <td>₹{Number(product.price).toLocaleString("en-IN")}</td>

                  <td>{product.reorder_level}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => openEditForm(product)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => deleteProduct(product.id)}
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
          <div className="product-modal">
            <div className="modal-header">
              <div>
                <h3>{editingProduct ? "Edit Product" : "Add Product"}</h3>

                <p>Enter the product information below.</p>
              </div>

              <button className="close-button" onClick={closeForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Product Name</label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Wireless Mouse"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows="3"
                  />
                </div>

                <div className="form-field">
                  <label>Price</label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="749"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Reorder Level</label>

                  <input
                    type="number"
                    name="reorder_level"
                    value={form.reorder_level}
                    onChange={handleInputChange}
                    placeholder="15"
                    min="0"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Category</label>

                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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

                <button type="submit" className="primary-button">
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
