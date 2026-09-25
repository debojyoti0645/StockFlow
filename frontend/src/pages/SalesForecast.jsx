import { useEffect, useState } from "react";
import "./SalesForecast.css";

const API_URL = "http://127.0.0.1:8000";

function SalesForecast() {
  const [products, setProducts] = useState([]);
  const [forecasts, setForecasts] = useState([]);

  const [productId, setProductId] = useState("");
  const [forecastDate, setForecastDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    loadProducts();
    loadForecasts();

    const today = new Date().toISOString().split("T")[0];
    setForecastDate(today);
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}/products/`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load products");
      }

      setProducts(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadForecasts() {
    try {
      const response = await fetch(`${API_URL}/sales-forecasts/`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load forecasts");
      }

      setForecasts(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function generateForecast(event) {
    event.preventDefault();

    if (!productId) {
      setMessage("Please select a product.");
      return;
    }

    if (!forecastDate) {
      setMessage("Please select a forecast date.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/sales-forecasts/generate/${productId}?forecast_date=${forecastDate}`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate forecast"
        );
      }

      setMessage("Sales forecast generated successfully.");

      await loadForecasts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getProductName(id) {
    const product = products.find(
      (item) => item.id === id
    );

    return product
      ? product.name
      : `Product #${id}`;
  }

  return (
    <div className="forecast-page">
      {message && (
        <div className="forecast-message">
          {message}
        </div>
      )}

      <div className="forecast-generator">
        <div className="generator-heading">
          <div className="generator-icon">⌁</div>

          <div>
            <h2>Generate Forecast</h2>
            <p>
              Select a product and forecast date to calculate
              expected demand.
            </p>
          </div>
        </div>

        <form
          className="forecast-form"
          onSubmit={generateForecast}
        >
          <div className="forecast-field">
            <label>Product</label>

            <select
              value={productId}
              onChange={(event) =>
                setProductId(event.target.value)
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
          </div>

          <div className="forecast-field">
            <label>Forecast Date</label>

            <input
              type="date"
              value={forecastDate}
              onChange={(event) =>
                setForecastDate(event.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="generate-button"
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate Forecast"}
          </button>
        </form>
      </div>

      <div className="forecast-info">
        <div className="info-icon">i</div>

        <div>
          <strong>How forecasting works</strong>

          <p>
            StockFlow calculates expected demand using historical
            sales quantities for the selected product.
          </p>
        </div>
      </div>

      <div className="forecast-table-card">
        <div className="table-heading">
          <div>
            <h2>Forecast History</h2>
            <p>
              Previously generated sales forecasts.
            </p>
          </div>

          <button
            className="refresh-forecast-button"
            onClick={loadForecasts}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="forecast-table-wrapper">
          <table className="forecast-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Forecast Date</th>
                <th>Predicted Quantity</th>
                <th>Actual Quantity</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {forecasts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="forecast-empty"
                  >
                    No forecasts generated yet.
                  </td>
                </tr>
              ) : (
                forecasts.map((forecast) => (
                  <tr key={forecast.id}>
                    <td>
                      <strong>
                        #{forecast.id}
                      </strong>
                    </td>

                    <td>
                      <div className="product-name">
                        {getProductName(
                          forecast.product_id
                        )}
                      </div>
                    </td>

                    <td>
                      {forecast.forecast_date}
                    </td>

                    <td>
                      <span className="prediction-value">
                        {Number(
                          forecast.predicted_quantity
                        ).toFixed(0)}
                      </span>
                    </td>

                    <td>
                      {forecast.actual_quantity !== null &&
                      forecast.actual_quantity !== undefined
                        ? Number(
                            forecast.actual_quantity
                          ).toFixed(0)
                        : "-"}
                    </td>

                    <td>
                      {forecast.created_at
                        ? new Date(
                            forecast.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SalesForecast;