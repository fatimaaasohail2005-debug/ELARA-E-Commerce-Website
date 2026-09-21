import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_KEY = "elara_cart";
const WISHLIST_KEY = "elara_wishlist";

/* =========================
   READ CART
========================= */

function readCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

/* =========================
   PROVIDER
========================= */

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCart);

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(WISHLIST_KEY) || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");

  /* =========================
     SAVE CART
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

    /*
      IMPORTANT:
      Tell the Navbar immediately that
      the cart has changed.
    */
    window.dispatchEvent(
      new CustomEvent("elara:cart-updated")
    );
  }, [cart]);

  /* =========================
     SAVE WISHLIST
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  /* =========================
     NOTIFICATION
  ========================= */

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice("");
    }, 2600);

    return () => clearTimeout(timer);
  }, [notice]);

  /* =========================
     ADD TO CART
  ========================= */

  function addToCart(product, quantity = 1) {
    if (!product) return;

    const id =
      product.id ??
      product._id;

    if (id === undefined || id === null) {
      return;
    }

    const stock = Number(
      product.stock ?? 999999
    );

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === id
      );

      if (existing) {
        return previous.map((item) => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(
              Number(item.quantity || 0) +
                Number(quantity || 1),
              stock
            ),
          };
        });
      }

      return [
        ...previous,
        {
          id,

          name:
            product.name ||
            "Product",

          price:
            Number(product.price || 0),

          oldPrice:
            Number(
              product.oldPrice ||
                product.old_price ||
                0
            ),

          image:
            product.image ||
            product.image_url ||
            product.imageUrl ||
            "",

          stock,

          quantity: Math.min(
            Number(quantity || 1),
            stock
          ),
        },
      ];
    });

    setNotice(
      `${product.name} added to cart`
    );
  }

  /* =========================
     UPDATE QUANTITY
  ========================= */

  function updateQuantity(
    id,
    quantity
  ) {
    setCart((previous) => {
      return previous
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            quantity: Math.max(
              1,
              Math.min(
                Number(quantity),
                Number(
                  item.stock || 999999
                )
              )
            ),
          };
        })
        .filter(
          (item) =>
            Number(item.quantity) > 0
        );
    });
  }

  /* =========================
     REMOVE
  ========================= */

  function removeFromCart(id) {
    setCart((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  }

  /* =========================
     CLEAR CART
  ========================= */

  function clearCart() {
    setCart([]);
  }

  /* =========================
     WISHLIST
  ========================= */

  function toggleWishlist(product) {
    if (!product) return;

    const id =
      product.id ??
      product._id;

    setWishlist((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (item) => item !== id
        );
      }

      return [
        ...previous,
        id,
      ];
    });
  }

  /* =========================
     CART COUNT
  ========================= */

  const count = cart.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  /* =========================
     SUBTOTAL
  ========================= */

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  /* =========================
     SHIPPING
  ========================= */

  const shippingThreshold = Number(
    import.meta.env
      .VITE_FREE_SHIPPING_THRESHOLD ||
      100
  );

  const shipping =
    subtotal === 0 ||
    subtotal >= shippingThreshold
      ? 0
      : 5;

  /* =========================
     TOTAL
  ========================= */

  const total =
    subtotal + shipping;

  /* =========================
     CONTEXT VALUE
  ========================= */

  const value = useMemo(
    () => ({
      cart,
      wishlist,

      cartOpen,
      setCartOpen,

      notice,

      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,

      toggleWishlist,

      count,
      subtotal,
      shipping,
      total,
      shippingThreshold,
    }),
    [
      cart,
      wishlist,
      cartOpen,
      notice,
      count,
      subtotal,
      shipping,
      total,
      shippingThreshold,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useCart() {
  return useContext(CartContext);
}