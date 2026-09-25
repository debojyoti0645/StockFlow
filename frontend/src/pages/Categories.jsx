import { useEffect, useState } from "react";
import "./Categories.css";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/categories/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load categories"
        );
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
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
    });

    setShowForm(true);
    setError("");
  }

  function openEditForm(category) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      description: category.description || "",
    });

    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingCategory(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    const categoryData = {
      name: form.name,
      description: form.description,
    };

    try {
      const url = editingCategory
        ? `http://127.0.0.1:8000/categories/${editingCategory.id}`
        : "http://127.0.0.1:8000/categories/";

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save category"
        );
      }

      closeForm();
      fetchCategories();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteCategory(categoryId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/categories/${categoryId}`,
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
          data.detail || "Unable to delete category"
        );
      }

      fetchCategories();
    } catch (error) {
      setError(error.message);
    }
  }

  const filteredCategories = categories.filter((category) => {
    const searchText = search.toLowerCase();

    return (
      category.name.toLowerCase().includes(searchText) ||
      (category.description || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div className="categories-page">
      <div className="page-heading">
        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Category
        </button>
      </div>

      {error && (
        <div className="categories-error">
          {error}
        </div>
      )}

      <div className="categories-toolbar">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span>
          {filteredCategories.length} categor
          {filteredCategories.length !== 1 ? "ies" : "y"}
        </span>
      </div>

      <div className="categories-table-card">
        <table className="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="empty-row"
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <span className="category-id">
                      #{category.id}
                    </span>
                  </td>

                  <td>
                    <div className="category-name">
                      {category.name}
                    </div>
                  </td>

                  <td>
                    <div className="category-description">
                      {category.description ||
                        "No description"}
                    </div>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() =>
                          openEditForm(category)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteCategory(category.id)
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

          <div className="category-modal">

            <div className="modal-header">
              <div>
                <h3>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h3>

                <p>
                  Enter the category information below.
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
                  <label>Category Name</label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Electronics"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Enter category description"
                    rows="4"
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
                  {editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Categories;