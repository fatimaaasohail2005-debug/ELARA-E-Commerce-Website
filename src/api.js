const API_BASE = "https://elara-backend-production.up.railway.app/api";

// ============================================================
// GET ALL PRODUCTS
// ============================================================

export async function getProducts() {
  const response = await fetch(`${API_BASE}/products`);

  if (!response.ok) {
    throw new Error(
      `Unable to load products. Server returned ${response.status}.`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Unable to load products."
    );
  }

  return Array.isArray(result.data) ? result.data : [];
}


// ============================================================
// GET SINGLE PRODUCT
// ============================================================

export async function getProduct(id) {
  const response = await fetch(`${API_BASE}/products/${id}`);

  if (!response.ok) {
    throw new Error(
      `Unable to load product. Server returned ${response.status}.`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Product not found."
    );
  }

  return result.data;
}


// ============================================================
// GET CATEGORIES
// ============================================================

export async function getCategories() {
  const response = await fetch(
    `${API_BASE}/products/categories`
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load categories. Server returned ${response.status}.`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Unable to load categories."
    );
  }

  return Array.isArray(result.data) ? result.data : [];
}


// ============================================================
// CREATE ORDER
// ============================================================

export async function createOrder(order) {
  const response = await fetch(
    `${API_BASE}/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to place order. Server returned ${response.status}.`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Unable to place order."
    );
  }

  localStorage.setItem(
    "elara_last_order",
    JSON.stringify(result)
  );

  return result;
}


// ============================================================
// EXPORT API BASE
// ============================================================

export { API_BASE };

