import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";

import {
  createOrder,
  getProduct,
} from "./api";

import {
  useCart,
} from "./CartContext";

import {
  CartDrawer,
  Footer,
  Loading,
} from "./Components";


/* =========================================================
   MONEY FORMAT
========================================================= */

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}


/* =========================================================
   PRODUCT HELPERS
========================================================= */

function getProductId(product) {
  return product?.id ?? product?._id;
}


function getProductImage(product) {
  return (
    product?.image ||
    product?.image_url ||
    product?.imageUrl ||
    product?.thumbnail ||
    ""
  );
}


function getOldPrice(product) {
  return Number(
    product?.oldPrice ??
      product?.old_price ??
      0
  );
}


function getRating(product) {
  return Number(
    product?.rating ?? 0
  );
}


function getReviews(product) {
  return Number(
    product?.reviews ??
      product?.review_count ??
      0
  );
}


function getStock(product) {
  return Math.max(
    0,
    Number(
      product?.stock ?? 1
    )
  );
}


/* =========================================================
   PRODUCT CHECKOUT PAGE
========================================================= */

export default function ProductCheckout() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  /* =======================================================
     CART CONTEXT
  ======================================================= */

  const {
    cart = [],
    addToCart,
    setCartOpen,
    subtotal = 0,
    clearCart,
    shippingThreshold = 5000,
  } = useCart();


  /* =======================================================
     PRODUCT STATE
  ======================================================= */

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [image, setImage] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);


  /*
     IMPORTANT:
     If URL contains ?checkout=true,
     show checkout immediately.
  */

  const [checkout, setCheckout] =
    useState(
      searchParams.get("checkout") ===
        "true"
    );


  /* =======================================================
     ORDER STATE
  ======================================================= */

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState("");


  /* =======================================================
     CHECKOUT FORM
  ======================================================= */

  const [form, setForm] =
  useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    payment: "cod",

    sender_name: "",
    sender_bank: "",
    account_number: "",
    transaction_reference: "",
    transfer_amount: "",
  });


  /* =======================================================
     FIELD VALIDATION STATE
  ======================================================= */

  const [fieldErrors, setFieldErrors] =
    useState({});


  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {

    let mounted = true;

    async function loadProduct() {

      try {

        setLoading(true);
        setError("");

        const data =
          await getProduct(id);

        if (!mounted) {
          return;
        }

        if (!data) {
          throw new Error(
            "Product could not be found."
          );
        }

        setProduct(data);

        setImage(
          getProductImage(data)
        );

        setQuantity(1);

      } catch (err) {

        console.error(err);

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Product could not be loaded."
        );

        setProduct(null);

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }

    if (id) {
      loadProduct();
    } else {

      setLoading(false);

      setError(
        "No product was selected."
      );

    }

    return () => {
      mounted = false;
    };

  }, [id]);


  /* =======================================================
     PRODUCT INFORMATION
  ======================================================= */

  const price =
    Number(
      product?.price || 0
    );


  const oldPrice =
    getOldPrice(product);


  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) /
            oldPrice) *
            100
        )
      : Number(
          product?.discount || 0
        );


  const rating =
    getRating(product);


  const reviews =
    getReviews(product);


  const stock =
    getStock(product);


  /* =======================================================
     CART ITEM
  ======================================================= */

  const cartItem =
    useMemo(() => {

      return cart.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    }, [cart, id]);


  /* =======================================================
     ORDER ITEMS
  ======================================================= */

  const orderItems =
    checkout && cart.length
      ? cart
      : product
        ? [
            {
              id:
                getProductId(
                  product
                ),

              name:
                product.name ||
                "Product",

              price,

              quantity,
            },
          ]
        : [];


  /* =======================================================
     ORDER TOTALS
  ======================================================= */

  const orderSubtotal =
    checkout && cart.length
      ? Number(subtotal || 0)
      : price * quantity;


  const threshold =
    Number(
      shippingThreshold || 100
    );


  const orderShipping =
    orderSubtotal === 0 ||
    orderSubtotal >= threshold
      ? 0
      : 250;


  const orderTotal =
    orderSubtotal +
    orderShipping;


  /* =======================================================
     UPDATE FORM
  ======================================================= */

  function updateForm(
    field,
    value
  ) {

    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );


    /*
      Clear the error for this field as soon
      as the customer starts correcting it.
    */

    setFieldErrors(
      (previous) => {

        if (!previous[field]) {
          return previous;
        }

        const next = {
          ...previous,
        };

        delete next[field];

        return next;

      }
    );


    /*
      Clear the general error when the user
      starts correcting a field.
    */

    if (error) {
      setError("");
    }

  }


  /* =======================================================
     FIELD CLASS HELPER
  ======================================================= */

  function fieldClass(field) {

    return fieldErrors[field]
      ? "input-error"
      : "";

  }


  /* =======================================================
     ADD TO CART
  ======================================================= */

  function handleAddToCart() {

    if (!product) {
      return;
    }

    if (stock <= 0) {

      setError(
        "This product is currently out of stock."
      );

      return;
    }

    addToCart(
      product,
      quantity
    );

    setError("");
    setCheckout(true);

  }


  /* =======================================================
     BUY NOW
  ======================================================= */

  function handleBuyNow() {

    if (!product) {
      return;
    }

    if (stock <= 0) {

      setError(
        "This product is currently out of stock."
      );

      return;
    }

    addToCart(
      product,
      quantity
    );

    setError("");
    setCheckout(true);

  }


  /* =======================================================
     QUANTITY CONTROLS
  ======================================================= */

  function decreaseQuantity() {

    setQuantity(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );

  }


  function increaseQuantity() {

    setQuantity(
      (current) =>
        Math.min(
          stock || 1,
          current + 1
        )
    );

  }


  /* =======================================================
     CART QUANTITY CONTROLS
  ======================================================= */

  function updateCartItemQuantity(
    item,
    change
  ) {

    const itemId =
      getProductId(item);

    const currentQuantity =
      Number(
        item.quantity || 1
      );

    const newQuantity =
      currentQuantity + change;


    if (newQuantity <= 0) {
      return;
    }


    try {

      const storedCart =
        JSON.parse(
          localStorage.getItem(
            "elara_cart"
          ) || "[]"
        );


      const nextCart =
        storedCart.map(
          (cartProduct) => {

            const cartProductId =
              getProductId(
                cartProduct
              );

            if (
              String(
                cartProductId
              ) ===
              String(itemId)
            ) {

              const maxStock =
                Number(
                  cartProduct.stock ??
                    999
                );

              return {
                ...cartProduct,
                quantity:
                  Math.min(
                    newQuantity,
                    maxStock
                  ),
              };

            }

            return cartProduct;

          }
        );


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

    } catch (err) {

      console.error(
        "Could not update cart:",
        err
      );

    }

  }


  /* =======================================================
     REMOVE CART ITEM
  ======================================================= */

  function removeCartItem(item) {

    const itemId =
      getProductId(item);


    try {

      const storedCart =
        JSON.parse(
          localStorage.getItem(
            "elara_cart"
          ) || "[]"
        );


      const nextCart =
        storedCart.filter(
          (cartProduct) =>
            String(
              getProductId(
                cartProduct
              )
            ) !==
            String(itemId)
        );


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


      if (
        nextCart.length === 0
      ) {

        navigate("/");

      }

    } catch (err) {

      console.error(
        "Could not remove item:",
        err
      );

    }

  }


  /* =======================================================
     VALIDATE CHECKOUT FORM
  ======================================================= */

  function validateCheckoutForm() {

    const errors = {};


    /* -----------------------------------------------------
       CUSTOMER NAME
    ----------------------------------------------------- */

    const name =
      form.name.trim();

    if (!name) {

      errors.name =
        "Please enter your full name.";

    } else if (
      name.length < 2
    ) {

      errors.name =
        "Please enter a valid full name.";

    }


    /* -----------------------------------------------------
       EMAIL
    ----------------------------------------------------- */

    const email =
      form.email.trim();

    if (!email) {

      errors.email =
        "Please enter your email address.";

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
        email
      )
    ) {

      errors.email =
        "Please enter a valid email address.";

    }


    /* -----------------------------------------------------
       PHONE
    ----------------------------------------------------- */

    const phone =
      form.phone.trim();

    if (!phone) {

      errors.phone =
        "Please enter your phone number.";

    } else if (
      !/^[+]?[0-9\s()-]{7,20}$/.test(
        phone
      )
    ) {

      errors.phone =
        "Please enter a valid phone number.";

    }


    /* -----------------------------------------------------
       CITY
    ----------------------------------------------------- */

    const city =
      form.city.trim();

    if (!city) {

      errors.city =
        "Please enter your city.";

    } else if (
      city.length < 2
    ) {

      errors.city =
        "Please enter a valid city.";

    }


    /* -----------------------------------------------------
       DELIVERY ADDRESS
    ----------------------------------------------------- */

    const address =
      form.address.trim();

    if (!address) {

      errors.address =
        "Please enter your delivery address.";

    } else if (
      address.length < 5
    ) {

      errors.address =
        "Please enter a complete delivery address.";

    }


    /* -----------------------------------------------------
       BANK TRANSFER
    ----------------------------------------------------- */

    if (
      form.payment ===
      "bank_transfer"
    ) {

      const senderName =
        form.sender_name.trim();

      const senderBank =
        form.sender_bank.trim();

      const transactionReference =
        form.transaction_reference.trim();

      const amountText =
        String(
          form.transfer_amount ?? ""
        ).trim();


      /* ---------------------------------------------------
         SENDER NAME
      --------------------------------------------------- */

      if (!senderName) {

        errors.sender_name =
          "Please enter the sender or account name.";

      } else if (
        senderName.length < 2
      ) {

        errors.sender_name =
          "Please enter a valid sender or account name.";

      }


      /* ---------------------------------------------------
         BANK NAME
      --------------------------------------------------- */

      if (!senderBank) {

        errors.sender_bank =
          "Please enter the bank name used for the transfer.";

      } else if (
        senderBank.length < 2
      ) {

        errors.sender_bank =
          "Please enter a valid bank name.";

      }
      /* ---------------------------------------------------
   ACCOUNT NUMBER
--------------------------------------------------- */

const accountNumber =
  String(
    form.account_number || ""
  )
    .replace(/\s+/g, "")
    .trim();

if (!accountNumber) {
  errors.account_number =
    "Please enter your account number.";
} else if (
  !/^[0-9]{10,24}$/.test(accountNumber)
) {
  errors.account_number =
    "Please enter a valid account number.";
}

      /* ---------------------------------------------------
         TRANSACTION REFERENCE
      --------------------------------------------------- */

      if (!transactionReference) {

        errors.transaction_reference =
          "Please enter the transaction or reference number.";

      } else if (
        transactionReference.length < 3
      ) {

        errors.transaction_reference =
          "Please enter a valid transaction or reference number.";

      }


      /* ---------------------------------------------------
         TRANSFER AMOUNT
      --------------------------------------------------- */

      if (!amountText) {

        errors.transfer_amount =
          "Please enter the amount transferred.";

      } else {

        const transferredAmount =
          Number(
            amountText
          );


        if (
          !Number.isFinite(
            transferredAmount
          ) ||
          transferredAmount <= 0
        ) {

          errors.transfer_amount =
            "Please enter a valid transfer amount.";

        } else if (
          Math.abs(
            transferredAmount -
            orderTotal
          ) > 0.01
        ) {

          errors.transfer_amount =
            `The transfer amount must match your order total of ${money(orderTotal)}.`;

        }

      }

    }


    return errors;

  }


  /* =======================================================
     PLACE ORDER
  ======================================================= */

  async function handlePlaceOrder(
    event
  ) {

    event.preventDefault();

    setError("");


    /* -----------------------------------------------------
       ORDER ITEMS
    ----------------------------------------------------- */

    if (!orderItems.length) {

      setError(
        "Your order does not contain any products."
      );

      return;
    }


    /* -----------------------------------------------------
       VALIDATE ALL FIELDS
    ----------------------------------------------------- */

    const validationErrors =
      validateCheckoutForm();


    if (
      Object.keys(
        validationErrors
      ).length > 0
    ) {

      setFieldErrors(
        validationErrors
      );


      /*
        Show the first validation error
        at the top of the form as well.
      */

      const firstError =
        Object.values(
          validationErrors
        )[0];

      setError(
        firstError ||
        "Please correct the highlighted fields."
      );


      /*
        Scroll the first invalid field
        into view for a better checkout
        experience.
      */

      const firstField =
        Object.keys(
          validationErrors
        )[0];


      window.setTimeout(() => {

        const element =
          document.querySelector(
            `[name="${firstField}"]`
          );

        if (element) {

          element.focus({
            preventScroll: true,
          });

          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

        }

      }, 50);


      return;
    }


    /* -----------------------------------------------------
       CLEAR OLD FIELD ERRORS
    ----------------------------------------------------- */

    setFieldErrors({});


    try {

      setSubmitting(true);


      /* ---------------------------------------------------
         ORDER PAYLOAD
      --------------------------------------------------- */

      const order = {
  customer_name: form.name.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  address: form.address.trim(),
  city: form.city.trim(),
  postal_code: null,

  payment_method: form.payment,

  items: orderItems.map((item) => ({
    product_id: Number(item.id),
    quantity: Number(item.quantity || 1),
  })),
};


      /* ---------------------------------------------------
         SEND ORDER TO BACKEND
      --------------------------------------------------- */

      const response =
        await createOrder(
          order
        );


      /* ---------------------------------------------------
         CLEAR CART
      --------------------------------------------------- */

      clearCart();


      /* ---------------------------------------------------
         SUCCESS
      --------------------------------------------------- */

      setSuccess(
        response?.message ||
        "Your order has been placed successfully."
      );


    } catch (err) {

      console.error(err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Order could not be placed. Please try again."
      );

    } finally {

      setSubmitting(false);

    }

  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <>

        <div className="simple-top">

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
          >

            <ArrowLeft />

            Back to shop

          </button>

        </div>

        <Loading />

        <CartDrawer />

      </>
    );

  }


  /* =======================================================
     PRODUCT ERROR
  ======================================================= */

  if (
    error &&
    !product
  ) {

    return (
      <div className="page-error">

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

        <button
          type="button"
          className="btn primary"
          onClick={() =>
            navigate("/")
          }
        >
          Back to Shop
        </button>

      </div>
    );

  }


  /* =======================================================
     ORDER SUCCESS
  ======================================================= */

  if (success) {

    const firstName =
      form.name
        .trim()
        .split(/\s+/)[0] ||
      "there";


    return (
      <div className="success-page">

        <div className="success-card">

          <div className="success-icon">
            <Check />
          </div>

          <span className="eyebrow">
            ORDER CONFIRMED
          </span>

          <h1>
            Thank you,{" "}
            {firstName}!
          </h1>

          <p>
            {success}
          </p>

          <button
            type="button"
            className="btn primary"
            onClick={() =>
              navigate("/")
            }
          >
            Continue Shopping
          </button>

        </div>

      </div>
    );

  }


  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <>

      {/* ===================================================
          TOP BAR
      =================================================== */}

      <div className="simple-top container">

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
        >

          <ArrowLeft
            size={18}
          />

          Back to shop

        </button>


        <button
          type="button"
          className="mini-cart"
          onClick={() =>
            setCartOpen(true)
          }
        >

          <ShoppingBag
            size={18}
          />

          Cart (
          {cart.reduce(
            (total, item) =>
              total +
              Number(
                item.quantity || 0
              ),
            0
          )}
          )

        </button>

      </div>


      {/* ===================================================
          CHECKOUT CART OVERVIEW
      =================================================== */}

      {checkout && cart.length > 0 && (

        <section className="container checkout-cart">

          <div className="checkout-cart-header">

            <div>

              <span className="eyebrow">
                YOUR CART
              </span>

              <h2>
                Review your items
              </h2>

            </div>

            <span>
              {cart.reduce(
                (total, item) =>
                  total +
                  Number(
                    item.quantity || 0
                  ),
                0
              )}{" "}
              items
            </span>

          </div>


          <div className="checkout-cart-list">

            {cart.map(
              (item, index) => {

                const itemId =
                  getProductId(
                    item
                  );

                const itemImage =
                  getProductImage(
                    item
                  );

                const itemPrice =
                  Number(
                    item.price || 0
                  );

                const itemQuantity =
                  Number(
                    item.quantity || 1
                  );

                const itemTotal =
                  itemPrice *
                  itemQuantity;


                return (
                  <div
                    className="checkout-cart-row"
                    key={
                      itemId ??
                      index
                    }
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="checkout-cart-image">

                      {itemImage ? (

                        <img
                          src={itemImage}
                          alt={
                            item.name ||
                            "Product"
                          }
                        />

                      ) : (

                        <div className="image-fallback">
                          ELARA
                        </div>

                      )}

                    </div>


                    {/* PRODUCT INFO */}

                    <div className="checkout-cart-info">

                      <span>
                        {item.category ||
                          item.category_name ||
                          "Collection"}
                      </span>

                      <h3>
                        {item.name ||
                          "Product"}
                      </h3>

                      <strong>
                        {money(
                          itemPrice
                        )}
                      </strong>

                    </div>


                    {/* QUANTITY */}

                    <div className="checkout-cart-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          updateCartItemQuantity(
                            item,
                            -1
                          )
                        }
                        disabled={
                          itemQuantity <=
                          1
                        }
                        aria-label="Decrease quantity"
                      >

                        <Minus
                          size={14}
                        />

                      </button>


                      <span>
                        {itemQuantity}
                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          updateCartItemQuantity(
                            item,
                            1
                          )
                        }
                        aria-label="Increase quantity"
                      >

                        <Plus
                          size={14}
                        />

                      </button>

                    </div>


                    {/* ITEM TOTAL */}

                    <strong className="checkout-cart-total">

                      {money(
                        itemTotal
                      )}

                    </strong>


                    {/* REMOVE */}

                    <button
                      type="button"
                      className="checkout-cart-remove"
                      onClick={() =>
                        removeCartItem(
                          item
                        )
                      }
                      aria-label={`Remove ${
                        item.name ||
                        "product"
                      }`}
                    >

                      <Trash2
                        size={17}
                      />

                    </button>

                  </div>
                );

              }
            )}

          </div>

        </section>

      )}


      {/* ===================================================
          PRODUCT PAGE
      =================================================== */}

      {!checkout && (

        <main className="product-page container">

          <section className="product-detail">

            {/* GALLERY */}

            <div className="gallery">

              <div className="main-image">

                {image ? (

                  <img
                    src={image}
                    alt={
                      product?.name ||
                      "Product"
                    }
                  />

                ) : (

                  <div className="image-fallback large">
                    ELARA
                  </div>

                )}

              </div>

            </div>


            {/* THUMBNAILS */}

            {(() => {

              const productImages = [
                product?.image,
                product?.image_url,
                product?.imageUrl,
                product?.thumbnail,
              ]
                .filter(Boolean)
                .filter(
                  (
                    src,
                    index,
                    array
                  ) =>
                    array.indexOf(
                      src
                    ) === index
                );


              if (
                productImages.length <=
                1
              ) {
                return null;
              }


              return (

                <div className="thumbs">

                  {productImages
                    .slice(0, 4)
                    .map(
                      (
                        src,
                        index
                      ) => (

                        <button
                          type="button"
                          key={`${src}-${index}`}
                          className={
                            image === src
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setImage(
                              src
                            )
                          }
                        >

                          <img
                            src={src}
                            alt={`${product?.name || "Product"} thumbnail ${index + 1}`}
                          />

                        </button>

                      )
                    )}

                </div>

              );

            })()}


            {/* PRODUCT INFORMATION */}

            <div className="detail-copy">

              <span className="product-cat">

                {product?.category ||
                  product?.category_name ||
                  "Featured"}

              </span>


              <h1>

                {product?.name ||
                  "Untitled Product"}

              </h1>


              <div className="rating big">

                <Star
                  size={17}
                  fill="currentColor"
                />

                <strong>
                  {rating.toFixed(1)}
                </strong>

                <span>
                  ({reviews} reviews)
                </span>

              </div>


              <div className="detail-price">

                <strong>
                  {money(price)}
                </strong>


                {oldPrice >
                  price && (

                  <>

                    <del>
                      {money(
                        oldPrice
                      )}
                    </del>

                    <span>
                      -{discount}%
                    </span>

                  </>

                )}

              </div>


              <p className="description">

                {product?.description ||
                  "A carefully selected ELARA favorite, designed for quality, comfort, and everyday use."}

              </p>


              <div
                className={`stock ${
                  stock > 0
                    ? "in"
                    : "out"
                }`}
              >

                {stock > 0
                  ? `${stock} in stock`
                  : "Out of stock"}

              </div>


              <div className="purchase-row">

                <div className="qty large">

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                  >

                    <Minus />

                  </button>


                  <b>
                    {quantity}
                  </b>


                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      stock <= 0 ||
                      quantity >=
                        stock
                    }
                  >

                    <Plus />

                  </button>

                </div>


                <button
                  type="button"
                  className="btn primary grow"
                  disabled={
                    stock <= 0
                  }
                  onClick={
                    handleAddToCart
                  }
                >

                  Add to Cart

                </button>

              </div>


              <button
                type="button"
                className="btn outline wide"
                disabled={
                  stock <= 0
                }
                onClick={
                  handleBuyNow
                }
              >

                Buy Now

              </button>


              {cartItem && (

                <p className="cart-note">

                  {Number(
                    cartItem.quantity ||
                      0
                  )}{" "}
                  already in your cart.

                </p>

              )}

            </div>

          </section>

        </main>

      )}


      {/* ===================================================
          CHECKOUT FORM
      =================================================== */}

      {checkout && (

        <main className="container">

          <section className="checkout">

            {/* =================================================
                CHECKOUT FORM
            ================================================= */}

            <div className="checkout-form">

              <span className="eyebrow">
                CHECKOUT
              </span>


              <h2>
                Complete your order
              </h2>


              {error && (

                <div className="form-error">
                  {error}
                </div>

              )}


              <form
                onSubmit={
                  handlePlaceOrder
                }
              >

                <div className="form-grid">

                  {/* FULL NAME */}

                  <label
                    className={
                      fieldErrors.name
                        ? "field-invalid"
                        : ""
                    }
                  >

                    Full name

                    <input
                      type="text"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "name",
                          event.target.value
                        )
                      }
                      className={
                        fieldClass(
                          "name"
                        )
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />

                    {fieldErrors.name && (
                      <small className="field-error">
                        {fieldErrors.name}
                      </small>
                    )}

                  </label>


                  {/* EMAIL */}

                  <label
                    className={
                      fieldErrors.email
                        ? "field-invalid"
                        : ""
                    }
                  >

                    Email address

                    <input
                      type="email"
                      name="email"
                      value={
                        form.email
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "email",
                          event.target.value
                        )
                      }
                      className={
                        fieldClass(
                          "email"
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                    />

                    {fieldErrors.email && (
                      <small className="field-error">
                        {fieldErrors.email}
                      </small>
                    )}

                  </label>


                  {/* PHONE */}

                  <label
                    className={
                      fieldErrors.phone
                        ? "field-invalid"
                        : ""
                    }
                  >

                    Phone number

                    <input
                      type="tel"
                      name="phone"
                      value={
                        form.phone
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "phone",
                          event.target.value
                        )
                      }
                      className={
                        fieldClass(
                          "phone"
                        )
                      }
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                    />

                    {fieldErrors.phone && (
                      <small className="field-error">
                        {fieldErrors.phone}
                      </small>
                    )}

                  </label>


                  {/* CITY */}

                  <label
                    className={
                      fieldErrors.city
                        ? "field-invalid"
                        : ""
                    }
                  >

                    City

                    <input
                      type="text"
                      name="city"
                      value={
                        form.city
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "city",
                          event.target.value
                        )
                      }
                      className={
                        fieldClass(
                          "city"
                        )
                      }
                      placeholder="Enter your city"
                      autoComplete="address-level2"
                    />

                    {fieldErrors.city && (
                      <small className="field-error">
                        {fieldErrors.city}
                      </small>
                    )}

                  </label>

                </div>


                {/* DELIVERY ADDRESS */}

                <label
                  className={
                    fieldErrors.address
                      ? "field-invalid"
                      : ""
                  }
                >

                  Delivery address

                  <textarea
                    rows="3"
                    name="address"
                    value={
                      form.address
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "address",
                        event.target.value
                      )
                    }
                    className={
                      fieldClass(
                        "address"
                      )
                    }
                    placeholder="Enter your complete delivery address"
                    autoComplete="street-address"
                  />

                  {fieldErrors.address && (
                    <small className="field-error">
                      {fieldErrors.address}
                    </small>
                  )}

                </label>


                {/* =================================================
                    PAYMENT
                ================================================= */}

                <div className="payment">

                  <strong>
                    Payment method
                  </strong>


                  {/* CASH ON DELIVERY */}

                  <label className="radio">

                    <input
                      type="radio"
                      name="payment"
                      checked={
                        form.payment ===
                        "cod"
                      }
                      onChange={() =>
                        updateForm(
                          "payment",
                          "cod"
                        )
                      }
                    />

                    Cash on Delivery

                  </label>


                  {/* BANK TRANSFER */}

                  <label className="radio">

                    <input
                      type="radio"
                      name="payment"
                      checked={
                        form.payment ===
                        "bank_transfer"
                      }
                      onChange={() =>
                        updateForm(
                          "payment",
                          "bank_transfer"
                        )
                      }
                    />

                    Bank Transfer

                  </label>


                  {/* BANK TRANSFER INFORMATION */}

                  {form.payment ===
                    "bank_transfer" && (

                    <div className="bank-transfer-info">

                      <strong>
                        Bank Transfer
                      </strong>


                      <p>
                        Please transfer the order total to the
                        ELARA account below, then enter your
                        transfer details.
                      </p>


                      {/* ELARA BANK DETAILS */}

                      <div className="bank-transfer-details">

                        <div>
  
                         <div>
                          </div>
                          </div>
  <span>
    Bank
  </span>

  <strong>
    Bank transfer details will be provided after confirmation.
  </strong>
</div>

<div>
  <strong>
    Account Name : 
  </strong>

  <span>
    ELARA
  </span>
</div>

                        


                       <div>
  <strong>
    Account Number : 
  </strong>

  <span>
    Provided by ELARA after order confirmation
  </span>
</div>

<div>
  <strong>
    IBAN : 
  </strong>

  <span>
    Provided by ELARA after order confirmation
  </span>
</div>

                      {/* CUSTOMER TRANSFER DETAILS */}

                      <div className="transfer-form">

                        {/* SENDER NAME */}

                        <label
                          className={
                            fieldErrors.sender_name
                              ? "field-invalid"
                              : ""
                          }
                        >

                          Sender / Account name

                          <input
                            type="text"
                            name="sender_name"
                            value={
                              form.sender_name ||
                              ""
                            }
                            onChange={(event) =>
                              updateForm(
                                "sender_name",
                                event.target.value
                              )
                            }
                            className={
                              fieldClass(
                                "sender_name"
                              )
                            }
                            placeholder="Name used for the transfer"
                            autoComplete="name"
                          />

                          {fieldErrors.sender_name && (
                            <small className="field-error">
                              {
                                fieldErrors.sender_name
                              }
                            </small>
                          )}

                        </label>


                        {/* BANK NAME */}

                        <label
                          className={
                            fieldErrors.sender_bank
                              ? "field-invalid"
                              : ""
                          }
                        >

                          Bank name

                          <input
                            type="text"
                            name="sender_bank"
                            value={
                              form.sender_bank ||
                              ""
                            }
                            onChange={(event) =>
                              updateForm(
                                "sender_bank",
                                event.target.value
                              )
                            }
                            className={
                              fieldClass(
                                "sender_bank"
                              )
                            }
                            placeholder="Your bank name"
                            autoComplete="organization"
                          />

                          {fieldErrors.sender_bank && (
                            <small className="field-error">
                              {
                                fieldErrors.sender_bank
                              }
                            </small>
                          )}

                        </label>
                         {/* ACCOUNT NUMBER */}
<label
  className={
    fieldErrors.account_number
      ? "field-invalid"
      : ""
  }
>
  Account number

  <input
    type="text"
    name="account_number"
    value={
      form.account_number || ""
    }
    onChange={(event) =>
      updateForm(
        "account_number",
        event.target.value
      )
    }
    className={
      fieldClass(
        "account_number"
      )
    }
    placeholder="Enter your account number"
    inputMode="numeric"
    autoComplete="off"
  />

  {fieldErrors.account_number && (
    <small className="field-error">
      {fieldErrors.account_number}
    </small>
  )}
</label>

                        {/* TRANSACTION REFERENCE */}

                        <label
                          className={
                            fieldErrors.transaction_reference
                              ? "field-invalid"
                              : ""
                          }
                        >

                          Transaction / Reference number

                          <input
                            type="text"
                            name="transaction_reference"
                            value={
                              form.transaction_reference ||
                              ""
                            }
                            onChange={(event) =>
                              updateForm(
                                "transaction_reference",
                                event.target.value
                              )
                            }
                            className={
                              fieldClass(
                                "transaction_reference"
                              )
                            }
                            placeholder="Enter transaction reference"
                            autoComplete="off"
                          />

                          {fieldErrors.transaction_reference && (
                            <small className="field-error">
                              {
                                fieldErrors.transaction_reference
                              }
                            </small>
                          )}

                        </label>


                        {/* TRANSFER AMOUNT */}

                        <label
                          className={
                            fieldErrors.transfer_amount
                              ? "field-invalid"
                              : ""
                          }
                        >

                          Amount transferred

                          <input
                            type="number"
                            name="transfer_amount"
                            min="0"
                            step="0.01"
                            value={
                              form.transfer_amount ||
                              ""
                            }
                            onChange={(event) =>
                              updateForm(
                                "transfer_amount",
                                event.target.value
                              )
                            }
                            className={
                              fieldClass(
                                "transfer_amount"
                              )
                            }
                            placeholder={`Enter ${money(orderTotal)}`}
                            inputMode="decimal"
                          />

                          {fieldErrors.transfer_amount && (
                            <small className="field-error">
                              {
                                fieldErrors.transfer_amount
                              }
                            </small>
                          )}

                        </label>

                      </div>


                      <p className="bank-transfer-note">

                        After completing the transfer, enter your
                        transaction details above and click
                        <strong>
                          {" "}Place Order
                        </strong>.

                      </p>

                    </div>

                  )}

                </div>


                {/* PLACE ORDER */}

                <button
                  type="submit"
                  className="btn primary wide"
                  disabled={
                    submitting
                  }
                >

                  {submitting
                    ? "Placing order..."
                    : `Place Order · ${money(
                        orderTotal
                      )}`}

                </button>

              </form>

            </div>


            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <aside className="order-summary">

              <span className="eyebrow">
                SUMMARY
              </span>


              <h3>
                Your Order
              </h3>


              {orderItems.map(
                (
                  item,
                  index
                ) => (

                  <div
                    className="summary-item"
                    key={
                      item.id ??
                      index
                    }
                  >

                    <span>

                      {item.name}

                      {" × "}

                      {item.quantity}

                    </span>

                    <strong>

                      {money(
                        Number(
                          item.price ||
                            0
                        ) *
                          Number(
                            item.quantity ||
                              0
                          )
                      )}

                    </strong>

                  </div>

                )
              )}


              <hr />


              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  {money(
                    orderSubtotal
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Shipping
                </span>

                <strong>

                  {orderShipping
                    ? money(
                        orderShipping
                      )
                    : "Free"}

                </strong>

              </div>


              <div className="summary-total">

                <span>
                  Total
                </span>

                <strong>
                  {money(
                    orderTotal
                  )}
                </strong>

              </div>

            </aside>

          </section>

        </main>

      )}


      {/* ===================================================
          FOOTER
      =================================================== */}

      <Footer />


      {/* ===================================================
          CART DRAWER
      =================================================== */}

      <CartDrawer />

    </>
  );
}