import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import ProductCheckout from "./ProductCheckout";

export default function App() {
  return (
    <Routes>

      {/* Home / Shop */}
      <Route path="/" element={<Home />} />

      {/* Product Details + Checkout */}
      <Route
        path="/product/:id"
        element={<ProductCheckout />}
      />

      {/* Unknown URL */}
      <Route
        path="*"
        element={<Home />}
      />

    </Routes>
  );
}