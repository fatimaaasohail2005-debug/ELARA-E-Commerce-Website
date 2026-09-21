import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiChevronDown,
  FiHeart,
  FiMenu,
  FiMinus,
  FiPlus,
  FiSearch,
  FiShoppingBag,
  FiStar,
  FiTrash2,
  FiUser,
  FiX,
  FiTruck,
  FiShield,
  FiCreditCard,
  FiInstagram,
  FiFacebook,
  FiTwitter,
} from "react-icons/fi";

/* =========================================================
   HELPERS
========================================================= */

function productId(product) {
  return product?.id ?? product?._id;
}

function productImage(product) {
  return (
    product?.image ||
    product?.image_url ||
    product?.imageUrl ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=85"
  );
}

function productPrice(product) {
  return Number(product?.price || 0);
}

function productOldPrice(product) {
  return Number(product?.oldPrice || product?.old_price || 0);
}

function productCategory(product) {
  return (
    product?.category ||
    product?.category_name ||
    "Collection"
  );
}

function productRating(product) {
  return Number(product?.rating || 4.8);
}

function productReviews(product) {
  return Number(
    product?.reviews ||
      product?.review_count ||
      0
  );
}

function discountPercent(product) {
  const price = productPrice(product);
  const oldPrice = productOldPrice(product);

  if (!oldPrice || oldPrice <= price) {
    return 0;
  }

  return Math.round(
    ((oldPrice - price) / oldPrice) * 100
  );
}


export function Navbar({
  onSearch,
  wishlistCount = 0,
  wishlistProducts = [],
  onWishlist,
  onAddToCart,
}) {

  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchValue, setSearchValue] =
    useState("");

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [wishlistOpen, setWishlistOpen] =
    useState(false);


  /* =========================================================
     CART COUNT
  ========================================================= */

  function updateCartCount() {

    try {

      const storedCart =
        JSON.parse(
          localStorage.getItem(
            "elara_cart"
          ) || "[]"
        );


      if (!Array.isArray(storedCart)) {

        setCartCount(0);

        return;
      }


      const count =
        storedCart.reduce(
          (total, item) => {

            return (
              total +
              Number(
                item.quantity ?? 1
              )
            );

          },
          0
        );


      setCartCount(count);

    } catch (error) {

      console.error(
        "Could not read cart:",
        error
      );

      setCartCount(0);

    }

  }


  useEffect(() => {

    updateCartCount();


    function handleCartUpdate() {
      updateCartCount();
    }


    window.addEventListener(
      "elara:cart-updated",
      handleCartUpdate
    );


    window.addEventListener(
      "storage",
      handleCartUpdate
    );


    return () => {

      window.removeEventListener(
        "elara:cart-updated",
        handleCartUpdate
      );


      window.removeEventListener(
        "storage",
        handleCartUpdate
      );

    };

  }, []);


  /* =========================================================
     CART
  ========================================================= */

  function openCart() {

    setWishlistOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);


    window.dispatchEvent(
      new CustomEvent(
        "elara:open-cart"
      )
    );

  }


  /* =========================================================
     SEARCH
  ========================================================= */

  function openSearch() {

    setWishlistOpen(false);
    setAccountOpen(false);

    setSearchOpen(
      (current) => !current
    );

  }


  function submitSearch(event) {

    event.preventDefault();

    const value =
      searchValue.trim();


    if (!value) {
      return;
    }


    if (onSearch) {
      onSearch(value);
    }


    setSearchOpen(false);

  }


  /* =========================================================
     WISHLIST
  ========================================================= */

  function openWishlist() {

    setSearchOpen(false);
    setAccountOpen(false);

    setWishlistOpen(true);

  }


  function closeWishlist() {

    setWishlistOpen(false);

  }


  function removeFromWishlist(
    event,
    product
  ) {

    event.stopPropagation();

    if (onWishlist) {
      onWishlist(product);
    }

  }


  function addWishlistItemToCart(
    event,
    product
  ) {

    event.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
    }

  }


  function openWishlistProduct(
    product
  ) {

    const id =
      product?.id ??
      product?._id ??
      product?.product_id;


    if (!id) {
      return;
    }


    setWishlistOpen(false);

    navigate(
      `/product/${id}`
    );

  }


  /* =========================================================
     ACCOUNT
  ========================================================= */

  function openAccount() {

    setSearchOpen(false);
    setWishlistOpen(false);

    setAccountOpen(
      (current) => !current
    );

  }


  return (

    <>

      <header
        className="navbar"
      >

        <div className="navbar-inner">


          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            className="brand"
          >
            ELARA
          </Link>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="nav-links">

            <Link
              to="/"
              className={
                location.pathname === "/"
                  ? "active"
                  : ""
              }
            >
              Home
            </Link>


            <Link
              to="/shop"
              className={
                location.pathname === "/shop"
                  ? "active"
                  : ""
              }
            >
              Shop
            </Link>


            <Link
              to="/about"
            >
              About
            </Link>


            <Link
              to="/contact"
            >
              Contact
            </Link>

          </nav>


          {/* =================================================
              ACTION ICONS
          ================================================= */}

          <div className="nav-actions">


            {/* SEARCH */}

            <button
              type="button"
              className="cart-button"
              onClick={
                openSearch
              }
              aria-label="Search ELARA"
              title="Search"
            >
              <FiSearch />
            </button>


            {/* WISHLIST */}

            <button
              type="button"
              className="cart-button"
              onClick={
                openWishlist
              }
              aria-label="Open wishlist"
              title="Wishlist"
            >

              <FiHeart />

              {wishlistCount > 0 && (

                <span className="cart-count">
                  {wishlistCount}
                </span>

              )}

            </button>


            {/* ACCOUNT */}

            <button
              type="button"
              className="cart-button"
              onClick={
                openAccount
              }
              aria-label="Open account"
              title="Account"
            >
              <FiUser />
            </button>


            {/* CART */}

            <button
              type="button"
              className="cart-button"
              onClick={
                openCart
              }
              aria-label={
                `Shopping cart with ${cartCount} items`
              }
              title="Shopping cart"
            >

              <FiShoppingBag />

              {cartCount > 0 && (

                <span className="cart-count">
                  {cartCount}
                </span>

              )}

            </button>

          </div>


          {/* =================================================
              SEARCH BOX
          ================================================= */}

          {searchOpen && (

            <form
              onSubmit={
                submitSearch
              }
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: "20px",
                width: "280px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                background: "#ffffff",
                border: "1px solid #e8e8e8",
                boxShadow:
                  "0 12px 35px rgba(0,0,0,0.12)",
                zIndex: 2000,
              }}
            >

              <FiSearch
                style={{
                  flexShrink: 0,
                  opacity: 0.55,
                }}
              />


              <input
                type="search"
                value={
                  searchValue
                }
                onChange={(event) =>
                  setSearchValue(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                autoFocus
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  outline: "none",
                  padding: "7px 4px",
                  fontSize: "14px",
                  background: "transparent",
                }}
              />


              <button
                type="submit"
                className="cart-button"
                aria-label="Submit search"
              >
                <FiArrowRight />
              </button>

            </form>

          )}


          {/* =================================================
              ACCOUNT PANEL
          ================================================= */}

          {accountOpen && (

            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: "20px",
                width: "250px",
                padding: "20px",
                background: "#ffffff",
                border: "1px solid #e8e8e8",
                boxShadow:
                  "0 12px 35px rgba(0,0,0,0.12)",
                zIndex: 2000,
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >

                <strong>
                  My Account
                </strong>


                <button
                  type="button"
                  className="cart-button"
                  onClick={() =>
                    setAccountOpen(false)
                  }
                  aria-label="Close account"
                >
                  <FiX />
                </button>

              </div>


              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  opacity: 0.65,
                }}
              >
                Sign in to manage your
                profile, orders and account
                information.
              </p>


              <button
                type="button"
                className="light-button"
                style={{
                  width: "100%",
                }}
                onClick={() => {

                  alert(
                    "Account login will be connected when the backend authentication system is ready."
                  );

                }}
              >
                Sign in
              </button>

            </div>

          )}

        </div>

      </header>


      {/* =====================================================
          WISHLIST DRAWER
      ===================================================== */}

      {wishlistOpen && (

        <>

          {/* BACKDROP */}

          <div
            onClick={
              closeWishlist
            }
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.35)",
              zIndex: 3000,
            }}
          />


          {/* DRAWER */}

          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "min(420px, 92vw)",
              height: "100vh",
              background: "#ffffff",
              zIndex: 3001,
              display: "flex",
              flexDirection: "column",
              boxShadow:
                "-12px 0 35px rgba(0,0,0,0.14)",
            }}
            aria-label="ELARA wishlist"
          >

            {/* HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px",
                borderBottom:
                  "1px solid #eeeeee",
              }}
            >

              <div>

                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    textTransform:
                      "uppercase",
                    opacity: 0.55,
                    marginBottom: "5px",
                  }}
                >
                  ELARA
                </span>


                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: 600,
                  }}
                >
                  Wishlist
                </h2>

              </div>


              <button
                type="button"
                className="cart-button"
                onClick={
                  closeWishlist
                }
                aria-label="Close wishlist"
                title="Close"
              >
                <FiX />
              </button>

            </div>


            {/* PRODUCT COUNT */}

            <div
              style={{
                padding:
                  "14px 24px",
                borderBottom:
                  "1px solid #f1f1f1",
                fontSize: "13px",
                opacity: 0.65,
              }}
            >

              {wishlistProducts.length === 0
                ? "No saved products"
                : `${wishlistProducts.length} ${
                    wishlistProducts.length === 1
                      ? "saved product"
                      : "saved products"
                  }`}

            </div>


            {/* PRODUCTS */}

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px 24px",
              }}
            >

              {wishlistProducts.length === 0 ? (

                /* =================================================
                   EMPTY WISHLIST
                ================================================= */

                <div
                  style={{
                    minHeight: "55vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "30px",
                  }}
                >

                  <FiHeart
                    size={34}
                    strokeWidth={1.3}
                    style={{
                      marginBottom: "18px",
                      opacity: 0.35,
                    }}
                  />


                  <h3
                    style={{
                      margin:
                        "0 0 8px",
                      fontSize: "18px",
                      fontWeight: 600,
                    }}
                  >
                    Your wishlist is empty
                  </h3>


                  <p
                    style={{
                      margin:
                        "0 0 22px",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      opacity: 0.6,
                    }}
                  >
                    Save products you love
                    and come back to them
                    anytime.
                  </p>


                  <button
                    type="button"
                    className="light-button"
                    onClick={() => {

                      closeWishlist();

                      setTimeout(() => {

                        document
                          .getElementById("shop")
                          ?.scrollIntoView({
                            behavior:
                              "smooth",
                          });

                      }, 100);

                    }}
                  >
                    Continue shopping
                  </button>

                </div>

              ) : (

                /* =================================================
                   WISHLIST ITEMS
                ================================================= */

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >

                  {wishlistProducts.map(
                    (product) => {

                      const productId =
                        product?.id ??
                        product?._id ??
                        product?.product_id;


                      const productImage =
                        product?.image ||
                        product?.image_url ||
                        product?.imageUrl ||
                        "";


                      const productPrice =
                        Number(
                          product?.price || 0
                        );


                      const productOldPrice =
                        Number(
                          product?.oldPrice ??
                          product?.old_price ??
                          0
                        );


                      return (

                        <div
                          key={
                            String(
                              productId
                            )
                          }
                          style={{
                            display: "flex",
                            gap: "14px",
                            paddingBottom:
                              "16px",
                            borderBottom:
                              "1px solid #eeeeee",
                          }}
                        >

                          {/* IMAGE */}

                          <button
                            type="button"
                            onClick={() =>
                              openWishlistProduct(
                                product
                              )
                            }
                            style={{
                              width: "88px",
                              height: "105px",
                              flexShrink: 0,
                              border: "none",
                              padding: 0,
                              background:
                                "#f7f7f7",
                              overflow: "hidden",
                              cursor: "pointer",
                            }}
                            aria-label={
                              `View ${product?.name || "product"}`
                            }
                          >

                            {productImage ? (

                              <img
                                src={
                                  productImage
                                }
                                alt={
                                  product?.name ||
                                  "Product"
                                }
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit:
                                    "cover",
                                  display:
                                    "block",
                                }}
                              />

                            ) : (

                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize: "11px",
                                  opacity: 0.4,
                                }}
                              >
                                ELARA
                              </div>

                            )}

                          </button>


                          {/* DETAILS */}

                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection:
                                "column",
                            }}
                          >

                            <button
                              type="button"
                              onClick={() =>
                                openWishlistProduct(
                                  product
                                )
                              }
                              style={{
                                border: "none",
                                padding: 0,
                                background:
                                  "transparent",
                                textAlign:
                                  "left",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "14px",
                                fontWeight:
                                  600,
                                lineHeight:
                                  "1.4",
                                marginBottom:
                                  "7px",
                              }}
                            >
                              {product?.name ||
                                "Product"}
                            </button>


                            <span
                              style={{
                                fontSize:
                                  "13px",
                                opacity:
                                  0.55,
                                marginBottom:
                                  "8px",
                              }}
                            >
                              {product?.category ||
                                ""}
                            </span>


                            <div
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: "8px",
                                marginBottom:
                                  "12px",
                              }}
                            >

                              <strong
                                style={{
                                  fontSize:
                                    "14px",
                                }}
                              >
                                {productPrice.toLocaleString()}
                              </strong>


                              {productOldPrice >
                                productPrice && (

                                <span
                                  style={{
                                    fontSize:
                                      "12px",
                                    textDecoration:
                                      "line-through",
                                    opacity:
                                      0.45,
                                  }}
                                >
                                  {productOldPrice.toLocaleString()}
                                </span>

                              )}

                            </div>


                            <div
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: "8px",
                                marginTop:
                                  "auto",
                              }}
                            >

                              <button
                                type="button"
                                className="light-button"
                                onClick={(
                                  event
                                ) =>
                                  addWishlistItemToCart(
                                    event,
                                    product
                                  )
                                }
                                style={{
                                  padding:
                                    "8px 12px",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                Add to cart
                              </button>


                              <button
                                type="button"
                                className="cart-button"
                                onClick={(
                                  event
                                ) =>
                                  removeFromWishlist(
                                    event,
                                    product
                                  )
                                }
                                aria-label={
                                  `Remove ${
                                    product?.name ||
                                    "product"
                                  } from wishlist`
                                }
                                title="Remove"
                              >
                                <FiTrash2 />
                              </button>

                            </div>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </div>

          </aside>

        </>

      )}

    </>

  );

}
/* =========================================================
   HERO
========================================================= */

export function Hero({
  onShop,
  onShopNow,
  onExploreDeals,
}) {
  /*
    Home.jsx currently sends onShop.

    These fallbacks allow this component to also work
    if another page sends onShopNow or onExploreDeals.
  */

  const shopHandler =
    onShopNow || onShop;

  const dealsHandler =
    onExploreDeals || onShop;

  return (
    <section className="hero">
      <div className="hero-shell">

        {/* HERO TEXT */}

        <div className="hero-copy">

          <div className="eyebrow">
            <span className="eyebrow-dot" />
            NEW COLLECTION 2026
          </div>

          <h1>
            Everything You Love.
            <br />
            <span>
              All in One Place.
            </span>
          </h1>

          <p>
            Discover a refined collection
            of fashion, technology,
            lifestyle essentials and
            everyday favorites — carefully
            selected for modern living.
          </p>

          <div className="hero-actions">

            <button
              type="button"
              className="primary-button"
              onClick={shopHandler}
            >
              Shop Now
              <FiArrowRight />
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={dealsHandler}
            >
              Explore Deals
            </button>
          </div>

          <div className="hero-trust">

            <div>
              <FiTruck />
              <span>
                Fast delivery
              </span>
            </div>

            <div>
              <FiShield />
              <span>
                Secure checkout
              </span>
            </div>

            <div>
              <FiCreditCard />
              <span>
                Easy payments
              </span>
            </div>

          </div>
        </div>

        {/* HERO IMAGE */}

        <div className="hero-visual">

          <div className="hero-image-card">

            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=90"
              alt="ELARA curated collection"
            />

            <div className="hero-image-gradient" />

            <div className="hero-image-content">
              <span>
                CURATED FOR YOU
              </span>

              <strong>
                THE NEW EDIT
              </strong>
            </div>
          </div>

          <div className="hero-floating-card">

            <span>01</span>

            <div>
              <strong>
                New arrivals
              </strong>

              <small>
                Explore the latest edit
              </small>
            </div>

            <FiArrowRight />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CATEGORIES
========================================================= */

const fallbackCategories = [
  {
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Technology",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Lifestyle",
    image:
      "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Accessories",
    image:
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=85",
  },
];

export function Categories({
  categories = [],
  onSelect,
}) {
  const source =
    Array.isArray(categories) &&
    categories.length
      ? categories
      : fallbackCategories;

  return (
    <section
      className="section categories-section"
      id="categories"
    >
      <div className="section-shell">

        <div className="section-heading">

          <div>
            <span className="section-kicker">
              SHOP BY CATEGORY
            </span>

            <h2>
              Find your next favorite.
            </h2>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={() =>
              onSelect?.("All")
            }
          >
            View all
            <FiArrowRight />
          </button>
        </div>

        <div className="category-grid">

          {source
            .slice(0, 4)
            .map(
              (
                category,
                index
              ) => {

                const name =
                  typeof category ===
                  "string"
                    ? category
                    : category.name ||
                      category.category ||
                      category.title ||
                      "Collection";

                const image =
                  typeof category ===
                  "string"
                    ? fallbackCategories[
                        index %
                          fallbackCategories.length
                      ].image
                    : category.image ||
                      category.image_url ||
                      fallbackCategories[
                        index %
                          fallbackCategories.length
                      ].image;

                return (
                  <button
                    type="button"
                    className="category-card"
                    key={
                      name +
                      index
                    }
                    onClick={() =>
                      onSelect?.(
                        name
                      )
                    }
                  >
                    <img
                      src={image}
                      alt={name}
                    />

                    <div className="category-overlay" />

                    <div className="category-content">

                      <span>
                        0{index + 1}
                      </span>

                      <strong>
                        {name}
                      </strong>

                      <FiArrowRight />
                    </div>
                  </button>
                );
              }
            )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FILTERS
========================================================= */

export function Filters({
  categories = [],
  category = "All",
  setCategory,

  /*
    These are the OLD props used by your
    existing Home.jsx.
  */

  price = "all",
  setPrice,

  /*
    These are optional props for future use.
  */

  minPrice = "",
  setMinPrice,

  maxPrice = "",
  setMaxPrice,

  sort = "featured",
  setSort,
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  /*
    Your current Home.jsx uses:
      price = all
      price = 0-50
      price = 50-100
      price = 100+

    Therefore we keep that exact system.
  */

  return (
    <div className="filters-wrapper">

      {/* MOBILE FILTER BUTTON */}

      <button
        type="button"
        className="filter-mobile-toggle"
        onClick={() =>
          setMobileOpen(
            (value) => !value
          )
        }
      >
        <span>
          Filter & sort
        </span>

        <FiChevronDown
          className={
            mobileOpen
              ? "rotate"
              : ""
          }
        />
      </button>

      {/* FILTER AREA */}

      <div
        className={`filters ${
          mobileOpen
            ? "mobile-visible"
            : ""
        }`}
      >

        {/* CATEGORY */}

        <div className="filter-group">

          <label>
            Category
          </label>

          <div className="select-wrap">

            <select
              value={
                category === "All"
                  ? ""
                  : category
              }
              onChange={(event) => {
                const value =
                  event.target.value;

                setCategory?.(
                  value || "All"
                );
              }}
            >
              <option value="">
                All categories
              </option>

              {categories.map(
                (
                  item,
                  index
                ) => {

                  const name =
                    typeof item ===
                    "string"
                      ? item
                      : item.name ||
                        item.category ||
                        item.title ||
                        "Collection";

                  return (
                    <option
                      value={name}
                      key={
                        name +
                        index
                      }
                    >
                      {name}
                    </option>
                  );
                }
              )}
            </select>

            <FiChevronDown />
          </div>
        </div>

        {/* PRICE */}

        <div className="filter-group">

          <label>
            Price
          </label>

          <div className="select-wrap">

            <select
              value={price}
              onChange={(event) =>
                setPrice?.(
                  event.target.value
                )
              }
            >
              <option value="all">
                All prices
              </option>

              <option value="0-50">
                Under $50
              </option>

              <option value="50-100">
                $50 – $100
              </option>

              <option value="100+">
                Over $100
              </option>
            </select>

            <FiChevronDown />
          </div>
        </div>

        {/* SORT */}

        <div className="filter-group filter-sort">

          <label>
            Sort by
          </label>

          <div className="select-wrap">

            <select
              value={sort}
              onChange={(event) =>
                setSort?.(
                  event.target.value
                )
              }
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to high
              </option>

              <option value="price-high">
                Price: High to low
              </option>

              <option value="rating">
                Top rated
              </option>

              <option value="name">
                Name
              </option>

              <option value="newest">
                Newest
              </option>
            </select>

            <FiChevronDown />
          </div>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

export function ProductCard({
  product,
  onAddToCart,
  onWishlist,
  wishlist = [],
}) {
  const navigate =
    useNavigate();

  const id =
    productId(product);

  const price =
    productPrice(product);

  const oldPrice =
    productOldPrice(product);

  const discount =
    discountPercent(product);

  const rating =
    productRating(product);

  const reviews =
    productReviews(product);

  const isWishlisted =
    wishlist.includes(id);

  function openProduct() {
    if (
      id === undefined ||
      id === null
    ) {
      return;
    }

    navigate(
      `/product/${id}`
    );
  }

  function add(event) {
    event.stopPropagation();

    onAddToCart?.(
      product
    );
  }

  function toggleWish(event) {
    event.stopPropagation();

    onWishlist?.(
      product
    );
  }

  return (
    <article className="product-card">

      {/* IMAGE */}

      <div
        className="product-image-wrap"
        onClick={
          openProduct
        }
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.key ===
            "Enter"
          ) {
            openProduct();
          }
        }}
      >

        {discount > 0 && (
          <span className="product-badge">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          className={`wishlist-button ${
            isWishlisted
              ? "selected"
              : ""
          }`}
          onClick={
            toggleWish
          }
          aria-label="Add to wishlist"
        >
          <FiHeart />
        </button>

        <img
          className="product-image"
          src={productImage(
            product
          )}
          alt={
            product?.name ||
            "Product"
          }
          loading="lazy"
        />

        <div className="product-image-hover">

          <span>
            View product
          </span>

          <FiArrowRight />
        </div>
      </div>

      {/* PRODUCT INFO */}

      <div className="product-info">

        <div className="product-meta-row">

          <span>
            {productCategory(
              product
            )}
          </span>

          <span className="rating">

            <FiStar />

            {rating.toFixed(
              1
            )}

            {reviews > 0 && (
              <small>
                ({reviews})
              </small>
            )}
          </span>
        </div>

        <button
          type="button"
          className="product-name"
          onClick={
            openProduct
          }
        >
          {product?.name ||
            "Untitled Product"}
        </button>

        <div className="price-row">

          <strong>
            $
            {price.toFixed(
              2
            )}
          </strong>

          {oldPrice >
            price && (
            <del>
              $
              {oldPrice.toFixed(
                2
              )}
            </del>
          )}
        </div>

        <button
          type="button"
          className="add-product-button"
          onClick={add}
        >
          Add to Cart
          <FiPlus />
        </button>

      </div>
    </article>
  );
}

/* =========================================================
   PRODUCT GRID
========================================================= */

export function ProductGrid({
  products = [],
  loading = false,
  error = "",
  onAddToCart,
  onWishlist,
  wishlist = [],
}) {

  /* LOADING */

  if (loading) {
    return (
      <div className="product-grid">

        {Array.from({
          length: 8,
        }).map(
          (_, index) => (
            <div
              className="skeleton-card"
              key={index}
            >
              <div className="skeleton skeleton-image" />

              <div className="skeleton skeleton-small" />

              <div className="skeleton skeleton-title" />

              <div className="skeleton skeleton-price" />
            </div>
          )
        )}
      </div>
    );
  }

  /* ERROR */

  if (error) {
    return (
      <div className="empty-products">

        <div className="empty-icon">
          <FiX />
        </div>

        <h3>
          Unable to load products
        </h3>

        <p>
          {error}
        </p>
      </div>
    );
  }

  /* EMPTY */

  if (!products.length) {
    return (
      <div className="empty-products">

        <div className="empty-icon">
          <FiSearch />
        </div>

        <h3>
          No products found
        </h3>

        <p>
          Try another search term
          or adjust your filters.
        </p>
      </div>
    );
  }

  /* PRODUCTS */

  return (
    <div className="product-grid">

      {products.map(
        (
          product,
          index
        ) => (
          <ProductCard
            key={
              productId(
                product
              ) ?? index
            }
            product={
              product
            }
            onAddToCart={
              onAddToCart
            }
            onWishlist={
              onWishlist
            }
            wishlist={
              wishlist
            }
          />
        )
      )}
    </div>
  );
}

/* =========================================================
   DEAL BANNER
========================================================= */

export function DealBanner({
  onClick,
}) {
  return (
    <section className="deal-section">

      <div className="deal-shell">

        <div className="deal-copy">

          <span className="section-kicker">
            LIMITED TIME
          </span>

          <h2>
            Good things should
            cost less.
          </h2>

          <p>
            Discover selected
            products at special
            prices while the
            collection lasts.
          </p>

          <button
            type="button"
            className="light-button"
            onClick={onClick}
          >
            Shop the deals
            <FiArrowRight />
          </button>

        </div>

        <div className="deal-number">

          <span>
            UP TO
          </span>

          <strong>
            40
          </strong>

          <small>
            % OFF
          </small>

        </div>

      </div>
    </section>
  );
}

/* =========================================================
   CART DRAWER
========================================================= */

export function CartDrawer() {
  const navigate =
    useNavigate();

  const [open, setOpen] =
    useState(false);

  const [cart, setCart] =
    useState([]);

  /* -------------------------------------------------------
     LOAD / SYNC CART
  ------------------------------------------------------- */

  useEffect(() => {

    function syncCart() {
      try {
        const savedCart =
          JSON.parse(
            localStorage.getItem(
              "elara_cart"
            ) || "[]"
          );

        setCart(
          Array.isArray(
            savedCart
          )
            ? savedCart
            : []
        );
      } catch {
        setCart([]);
      }
    }

    function openCart() {
      syncCart();
      setOpen(true);
    }

    syncCart();

    window.addEventListener(
      "storage",
      syncCart
    );

    window.addEventListener(
      "elara:open-cart",
      openCart
    );

    window.addEventListener(
      "elara:cart-updated",
      syncCart
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncCart
      );

      window.removeEventListener(
        "elara:open-cart",
        openCart
      );

      window.removeEventListener(
        "elara:cart-updated",
        syncCart
      );
    };
  }, []);

  /* -------------------------------------------------------
     SAVE CART
  ------------------------------------------------------- */

  function saveCart(
    nextCart
  ) {
    setCart(nextCart);

    localStorage.setItem(
      "elara_cart",
      JSON.stringify(
        nextCart
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        "elara:cart-updated"
      )
    );
  }

  /* -------------------------------------------------------
     INCREASE
  ------------------------------------------------------- */

  function increase(item) {
    const stock =
      Number(
        item.stock || 999999
      );

    const nextCart =
      cart.map(
        (cartItem) =>
          cartItem.id ===
          item.id
            ? {
                ...cartItem,
                quantity:
                  Math.min(
                    Number(
                      cartItem.quantity ||
                        0
                    ) + 1,
                    stock
                  ),
              }
            : cartItem
      );

    saveCart(
      nextCart
    );
  }

  /* -------------------------------------------------------
     DECREASE
  ------------------------------------------------------- */

  function decrease(item) {
    if (
      Number(
        item.quantity || 0
      ) <= 1
    ) {
      remove(item.id);
      return;
    }

    const nextCart =
      cart.map(
        (cartItem) =>
          cartItem.id ===
          item.id
            ? {
                ...cartItem,
                quantity:
                  Number(
                    cartItem.quantity
                  ) - 1,
              }
            : cartItem
      );

    saveCart(
      nextCart
    );
  }

  /* -------------------------------------------------------
     REMOVE
  ------------------------------------------------------- */

  function remove(id) {
    saveCart(
      cart.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  /* -------------------------------------------------------
     TOTALS
  ------------------------------------------------------- */

  const subtotal =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );

  const threshold =
    Number(
      import.meta.env
        .VITE_FREE_SHIPPING_THRESHOLD ||
        100
    );

  const shipping =
    subtotal === 0 ||
    subtotal >=
      threshold
      ? 0
      : 5;

  const total =
    subtotal +
    shipping;

  /* -------------------------------------------------------
     CHECKOUT
  ------------------------------------------------------- */

  function checkout() {
    if (!cart.length) {
      return;
    }

    navigate(
      `/product/${cart[0].id}?checkout=true`
    );

    setOpen(false);
  }

  return (
    <>
      {/* BACKDROP */}

      {open && (
        <div
          className="drawer-backdrop"
          onClick={() =>
            setOpen(false)
          }
        />
      )}

      {/* DRAWER */}

      <aside
        className={`cart-drawer ${
          open
            ? "open"
            : ""
        }`}
      >

        {/* HEADER */}

        <div className="cart-header">

          <div>

            <span className="cart-kicker">
              YOUR BAG
            </span>

            <h2>
              Shopping Cart
            </h2>

          </div>

          <button
            type="button"
            className="drawer-close"
            onClick={() =>
              setOpen(false)
            }
            aria-label="Close cart"
          >
            <FiX />
          </button>

        </div>

        {/* BODY */}

        <div className="cart-body">

          {!cart.length ? (

            <div className="empty-cart">

              <div className="empty-cart-icon">
                <FiShoppingBag />
              </div>

              <h3>
                Your cart is empty
              </h3>

              <p>
                Discover something
                you love and add it
                to your bag.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setOpen(false)
                }
              >
                Continue Shopping
                <FiArrowRight />
              </button>

            </div>

          ) : (

            <div className="cart-items">

              {cart.map(
                (item) => (

                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <img
                      src={
                        item.image ||
                        productImage(
                          item
                        )
                      }
                      alt={
                        item.name ||
                        "Product"
                      }
                    />

                    <div className="cart-item-content">

                      <div className="cart-item-top">

                        <div>

                          <span>
                            ITEM
                          </span>

                          <h4>
                            {item.name ||
                              "Product"}
                          </h4>

                        </div>

                        <button
                          type="button"
                          className="remove-button"
                          onClick={() =>
                            remove(
                              item.id
                            )
                          }
                          aria-label="Remove item"
                        >
                          <FiTrash2 />
                        </button>

                      </div>

                      <div className="cart-item-bottom">

                        <strong>
                          $
                          {Number(
                            item.price ||
                              0
                          ).toFixed(
                            2
                          )}
                        </strong>

                        <div className="quantity-control">

                          <button
                            type="button"
                            onClick={() =>
                              decrease(
                                item
                              )
                            }
                            aria-label="Decrease quantity"
                          >
                            <FiMinus />
                          </button>

                          <span>
                            {Number(
                              item.quantity ||
                                0
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increase(
                                item
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            <FiPlus />
                          </button>

                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* SUMMARY */}

        {cart.length >
          0 && (

          <div className="cart-summary">

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                $
                {subtotal.toFixed(
                  2
                )}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Shipping
              </span>

              <strong>
                {shipping ===
                0
                  ? "FREE"
                  : `$${shipping.toFixed(
                      2
                    )}`}
              </strong>

            </div>

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                $
                {total.toFixed(
                  2
                )}
              </strong>

            </div>

            <p className="shipping-note">

              {shipping ===
              0
                ? "You qualify for free shipping."
                : `Free shipping on orders over $${threshold}.`}

            </p>

            <button
              type="button"
              className="checkout-button"
              onClick={
                checkout
              }
            >
              Proceed to Checkout
              <FiArrowRight />
            </button>

          </div>
        )}
      </aside>
    </>
  );
}

/* =========================================================
   TOAST
========================================================= */

export function Toast({
  message,
}) {
  if (!message) {
    return null;
  }

  return (
    <div className="toast">

      <span className="toast-check">
        ✓
      </span>

      <span>
        {message}
      </span>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

export function Loading() {
  return (
    <div className="loading-screen">

      <div className="loading-logo">
        ELARA<span>.</span>
      </div>

      <div className="loading-line" />

      <p>
        Loading collection
      </p>

    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

export function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-shell">

        <div className="footer-top">

          {/* BRAND */}

          <div className="footer-brand">

            <Link
              to="/"
              className="brand footer-logo"
            >
              ELARA<span>.</span>
            </Link>

            <p>
              Everything you love,
              thoughtfully brought
              together in one place.
            </p>

            <div className="social-links">

              <a
                href="#instagram"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>

              <a
                href="#facebook"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>

              <a
                href="#twitter"
                aria-label="Twitter"
              >
                <FiTwitter />
              </a>

            </div>
          </div>

          {/* SHOP */}

          <div className="footer-column">

            <h4>
              Shop
            </h4>

            <a href="#shop">
              All Products
            </a>

            <a href="#categories">
              Categories
            </a>

            <a href="#deals">
              Deals
            </a>

            <a href="#new">
              New Arrivals
            </a>

          </div>

          {/* CUSTOMER CARE */}

          <div className="footer-column">

            <h4>
              Customer Care
            </h4>

            <a href="#contact">
              Contact Us
            </a>

            <a href="#shipping">
              Shipping
            </a>

            <a href="#returns">
              Returns
            </a>

            <a href="#faq">
              FAQ
            </a>

          </div>

          {/* NEWSLETTER */}

          <div className="footer-column newsletter">

            <h4>
              Stay in the loop
            </h4>

            <p>
              New arrivals,
              exclusive offers and
              inspiration —
              delivered occasionally.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >

              <input
                type="email"
                placeholder="Your email address"
                aria-label="Your email address"
              />

              <button
                type="submit"
                aria-label="Subscribe"
              >
                <FiArrowRight />
              </button>

            </form>

          </div>

        </div>

        {/* FOOTER BOTTOM */}

        <div className="footer-bottom">

          <span>
            © 2026 ELARA.
            All rights reserved.
          </span>

          <div>

            <a href="#privacy">
              Privacy
            </a>

            <a href="#terms">
              Terms
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
}