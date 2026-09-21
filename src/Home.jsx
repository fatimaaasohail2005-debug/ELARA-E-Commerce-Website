import { useEffect, useMemo, useState } from "react";

import {
  getCategories,
  getProducts,
} from "./api";

import {
  Navbar,
  Hero,
  Categories,
  Filters,
  ProductGrid,
  CartDrawer,
  Footer,
} from "./Components";

import { useCart } from "./CartContext";


export default function Home() {

  const {
    notice,
    setCartOpen,
    addToCart,
  } = useCart();


  /* =========================================================
     STATE
  ========================================================= */

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [sort, setSort] = useState("featured");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  /* =========================================================
     WISHLIST
  ========================================================= */

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("elara_wishlist") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });


  /* =========================================================
     LOAD PRODUCTS + CATEGORIES
  ========================================================= */

  useEffect(() => {

    async function loadProducts() {

      try {

        setLoading(true);
        setError("");

        const [
          productData,
          categoryData,
        ] = await Promise.all([
          getProducts(),
          getCategories().catch(() => []),
        ]);


        setProducts(
          Array.isArray(productData)
            ? productData
            : []
        );


        const databaseCategories =
          Array.isArray(categoryData) &&
          categoryData.length
            ? categoryData
            : [
                ...new Set(
                  (
                    Array.isArray(productData)
                      ? productData
                      : []
                  )
                    .map(
                      (product) =>
                        product.category
                    )
                    .filter(Boolean)
                ),
              ];


        setCategories(
          databaseCategories
        );

      } catch (err) {

        console.error(
          "Unable to load products:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to connect to the backend."
        );

      } finally {

        setLoading(false);

      }
    }


    loadProducts();

  }, []);


  /* =========================================================
     SAVE WISHLIST
  ========================================================= */

  useEffect(() => {

    localStorage.setItem(
      "elara_wishlist",
      JSON.stringify(wishlist)
    );

  }, [wishlist]);


  /* =========================================================
     WISHLIST TOGGLE
  ========================================================= */

  function getProductId(product) {

    return String(
      product?.id ??
      product?._id ??
      product?.product_id ??
      ""
    );

  }


  function handleWishlist(product) {

    if (!product) {
      return;
    }

    const id = getProductId(product);

    if (!id) {
      return;
    }

    setWishlist((current) => {

      if (current.includes(id)) {

        return current.filter(
          (item) => item !== id
        );

      }

      return [
        ...current,
        id,
      ];

    });

  }


  /* =========================================================
     FILTER + SORT PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {

    let result =
      products.filter(
        (product) => {

          const searchableText = `
            ${product.name || ""}
            ${product.category || ""}
            ${product.description || ""}
          `.toLowerCase();


          const matchesSearch =
            !search ||
            searchableText.includes(
              search.toLowerCase()
            );


          const productCategory =
            String(
              product.category || ""
            ).toLowerCase();


          const selectedCategory =
            String(
              category || ""
            ).toLowerCase();


          const matchesCategory =
            !selectedCategory ||
            selectedCategory === "all" ||
            productCategory ===
              selectedCategory;


          const productPrice =
            Number(
              product.price || 0
            );


          let matchesMinPrice = true;
          let matchesMaxPrice = true;


          if (minPrice !== "") {

            matchesMinPrice =
              productPrice >=
              Number(minPrice);

          }


          if (maxPrice !== "") {

            matchesMaxPrice =
              productPrice <=
              Number(maxPrice);

          }


          return (
            matchesSearch &&
            matchesCategory &&
            matchesMinPrice &&
            matchesMaxPrice
          );

        }
      );


    result = [...result];


    /* =======================================================
       SORT
    ======================================================= */

    if (sort === "price-low") {

      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );

    }


    if (sort === "price-high") {

      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );

    }


    if (sort === "rating") {

      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );

    }


    if (sort === "newest") {

      result.sort(
        (a, b) => {

          const dateA =
            new Date(
              a.created_at ||
              a.createdAt ||
              0
            ).getTime();


          const dateB =
            new Date(
              b.created_at ||
              b.createdAt ||
              0
            ).getTime();


          return dateB - dateA;

        }
      );

    }


    if (sort === "name") {

      result.sort(
        (a, b) =>
          String(
            a.name || ""
          ).localeCompare(
            String(
              b.name || ""
            )
          )
      );

    }


    return result;

  }, [
    products,
    search,
    category,
    minPrice,
    maxPrice,
    sort,
  ]);


  /* =========================================================
     ADD TO CART
  ========================================================= */

  function handleAddToCart(product) {

    if (!product) {
      return;
    }


    const stock =
      Number(
        product.stock ?? 1
      );


    if (stock <= 0) {
      return;
    }


    addToCart(
      product,
      1
    );

  }


  /* =========================================================
     SEARCH
  ========================================================= */

  function handleSearch(value) {

    if (value === "__wishlist__") {

      const wishlistProducts =
        products.filter((product) =>
          wishlist.includes(
            getProductId(product)
          )
        );

      if (wishlistProducts.length > 0) {

        setSearch("");

        setCategory("");

        setTimeout(() => {

          document
            .getElementById("shop")
            ?.scrollIntoView({
              behavior: "smooth",
            });

        }, 50);

      } else {

        alert(
          "Your ELARA wishlist is empty."
        );

      }

      return;
    }


    if (value === "__categories__") {

      document
        .getElementById("categories")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }


    if (value === "__deals__") {

      document
        .getElementById("deals")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }


    setSearch(
      String(value || "")
    );

    setCategory("");


    setTimeout(() => {

      document
        .getElementById("shop")
        ?.scrollIntoView({
          behavior: "smooth",
        });

    }, 50);

  }


  /* =========================================================
     SCROLL TO SHOP
  ========================================================= */

  function goToShop() {

    document
      .getElementById("shop")
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }


  /* =========================================================
     EXPLORE DEALS
  ========================================================= */

  function goToDeals() {

    document
      .getElementById("deals")
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }


  /* =========================================================
     CATEGORY SELECTION
  ========================================================= */

  function handleCategorySelect(
    selectedCategory
  ) {

    setCategory(
      selectedCategory || ""
    );


    document
      .getElementById("shop")
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <Navbar
  onSearch={handleSearch}
  wishlistCount={wishlist.length}
  wishlistProducts={products.filter((product) =>
    wishlist.includes(
      String(
        product?.id ??
        product?._id ??
        product?.product_id ??
        ""
      )
    )
  )}
  onWishlist={handleWishlist}
  onAddToCart={handleAddToCart}
/>


      <main>

        <Hero
          onShopNow={
            goToShop
          }
          onExploreDeals={
            goToDeals
          }
        />


        <Categories
          categories={
            categories
          }
          onSelect={
            handleCategorySelect
          }
        />


        <section
          id="shop"
          className="section shop-section"
        >

          <div className="container">

            <div className="section-head">

              <div>

                <span className="eyebrow">
                  OUR SELECTION
                </span>

                <h2>
                  Featured Products
                </h2>

              </div>


              <span className="muted">

                {filteredProducts.length}{" "}

                {filteredProducts.length ===
                1
                  ? "product"
                  : "products"}

              </span>

            </div>


            {error && (

              <div
                className="error-message"
                role="alert"
              >
                {error}
              </div>

            )}


            <Filters
              categories={
                categories
              }
              category={
                category
              }
              setCategory={
                setCategory
              }
              minPrice={
                minPrice
              }
              setMinPrice={
                setMinPrice
              }
              maxPrice={
                maxPrice
              }
              setMaxPrice={
                setMaxPrice
              }
              sort={
                sort
              }
              setSort={
                setSort
              }
            />


            <ProductGrid
              products={
                filteredProducts
              }
              loading={
                loading
              }
              error={
                error
              }
              onAddToCart={
                handleAddToCart
              }
              onWishlist={
                handleWishlist
              }
              wishlist={
                wishlist
              }
            />

          </div>

        </section>


        <section
          id="deals"
          className="deal-section"
        >

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
                onClick={
                  goToShop
                }
              >
                Shop the deals
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

      </main>


      <Footer />


      <CartDrawer />


      {notice && (

        <div className="toast">

          <span className="toast-check">
            ✓
          </span>

          <span>
            {notice}
          </span>

        </div>

      )}


      <button
        type="button"
        className="floating-cart"
        onClick={() =>
          setCartOpen(true)
        }
      >
        Cart
      </button>

    </>
  );
}