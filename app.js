const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartDeliveryFee = document.getElementById("cartDeliveryFee");
const cartAmountDue = document.getElementById("cartAmountDue");
const checkoutButton = document.getElementById("checkoutButton");
const paymentModal = document.getElementById("paymentModal");
const paymentOverlay = document.getElementById("paymentOverlay");
const closePayment = document.getElementById("closePayment");
const paymentForm = document.getElementById("paymentForm");
const paymentTotal = document.getElementById("paymentTotal");
const paymentSubtotal = document.getElementById("paymentSubtotal");
const cardFields = document.getElementById("cardFields");
const payButton = document.getElementById("payButton");
const useLocationButton = document.getElementById("useLocation");
const locationStatus = document.getElementById("locationStatus");
const DELIVERY_FEE_NGN = 1700;

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

let savedCart = JSON.parse(localStorage.getItem("eresiCart") || "{}");
let cart = Object.fromEntries(
  Object.entries(savedCart).filter(([name]) =>
    [...document.querySelectorAll(".dish")].some((dish) => dish.dataset.name === name)
  )
);
saveCart();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function saveCart() {
  localStorage.setItem("eresiCart", JSON.stringify(cart));
}

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function getDishImage(name) {
  const dish = [...document.querySelectorAll(".dish")]
    .find((item) => item.dataset.name === name);
  return dish ? dish.querySelector("img").src : "";
}

function renderCart() {
  const entries = Object.entries(cart);
  const itemCount = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [name, quantity]) => {
    const dish = [...document.querySelectorAll(".dish")]
      .find((item) => item.dataset.name === name);
    return sum + (dish ? Number(dish.dataset.price) * quantity : 0);
  }, 0);

  cartCount.textContent = itemCount;
  cartTotal.textContent = formatNaira(total);
  const deliveryFee = itemCount ? DELIVERY_FEE_NGN : 0;
  cartDeliveryFee.textContent = formatNaira(deliveryFee);
  cartAmountDue.textContent = formatNaira(total + deliveryFee);
  checkoutButton.disabled = itemCount === 0;

  if (!entries.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = entries.map(([name, quantity]) => {
    const dish = [...document.querySelectorAll(".dish")]
      .find((item) => item.dataset.name === name);
    const price = dish ? Number(dish.dataset.price) : 0;
    return `
      <div class="cart-item">
        <img src="${getDishImage(name)}" alt="">
        <div>
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-price">${formatNaira(price)}</div>
        </div>
        <div class="quantity" aria-label="Quantity for ${name}">
          <button type="button" data-action="decrease" data-name="${name}" aria-label="Decrease ${name}">−</button>
          <strong>${quantity}</strong>
          <button type="button" data-action="increase" data-name="${name}" aria-label="Increase ${name}">+</button>
        </div>
      </div>`;
  }).join("");
}

document.querySelectorAll(".add-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.closest(".dish").dataset.name;
    cart[name] = (cart[name] || 0) + 1;
    saveCart();
    renderCart();
    showToast(`${name} added to cart`);
  });
});

document.querySelectorAll(".heart").forEach((button) => {
  const savedFavorites = JSON.parse(localStorage.getItem("eresiFavorites") || "[]");
  const name = button.closest(".dish").dataset.name;
  if (savedFavorites.includes(name)) {
    button.classList.add("active");
    button.textContent = "♥";
  }
  button.addEventListener("click", () => {
    button.classList.toggle("active");
    button.textContent = button.classList.contains("active") ? "♥" : "♡";
    const favorites = JSON.parse(localStorage.getItem("eresiFavorites") || "[]");
    const updated = button.classList.contains("active")
      ? [...new Set([...favorites, name])]
      : favorites.filter((item) => item !== name);
    localStorage.setItem("eresiFavorites", JSON.stringify(updated));
  });
});

const searchForm = document.getElementById("searchForm");
const searchInput = searchForm.querySelector("input");
const menuGrid = document.querySelector(".menu-grid");

function filterDishes(category = "") {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  document.querySelectorAll(".dish").forEach((dish) => {
    const matchesCategory = !category || dish.dataset.category === category;
    const matchesQuery = !query || `${dish.dataset.name} ${dish.dataset.category} ${dish.querySelector(".dish-info").textContent}`.toLowerCase().includes(query);
    const visible = matchesCategory && matchesQuery;
    dish.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });

  const oldMessage = menuGrid.querySelector(".no-results");
  if (oldMessage) oldMessage.remove();
  if (!visibleCount) {
    menuGrid.insertAdjacentHTML("beforeend", '<p class="no-results">No dishes match your search.</p>');
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelectorAll(".category").forEach((item) => item.classList.remove("active"));
  filterDishes();
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", () => filterDishes());
document.getElementById("searchShortcut").addEventListener("click", () => {
  searchInput.focus();
  document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    searchInput.value = "";
    filterDishes(button.dataset.category);
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const name = button.dataset.name;
  if (button.dataset.action === "increase") cart[name] += 1;
  if (button.dataset.action === "decrease") {
    cart[name] -= 1;
    if (cart[name] <= 0) delete cart[name];
  }
  saveCart();
  renderCart();
});

checkoutButton.addEventListener("click", () => {
  if (!Object.keys(cart).length) return;
  closeCart();
  openPayment();
});

function openPayment() {
  const total = Object.entries(cart).reduce((sum, [name, quantity]) => {
    const dish = [...document.querySelectorAll(".dish")]
      .find((item) => item.dataset.name === name);
    return sum + (dish ? Number(dish.dataset.price) * quantity : 0);
  }, 0);
  paymentSubtotal.textContent = formatNaira(total);
  paymentTotal.textContent = formatNaira(total + DELIVERY_FEE_NGN);
  paymentModal.classList.add("open");
  paymentOverlay.classList.add("open");
  paymentModal.setAttribute("aria-hidden", "false");
  updatePaymentMethod();
}

function closePaymentModal() {
  paymentModal.classList.remove("open");
  paymentOverlay.classList.remove("open");
  paymentModal.setAttribute("aria-hidden", "true");
}

function updatePaymentMethod() {
  const method = paymentForm.querySelector('input[name="paymentMethod"]:checked').value;
  cardFields.classList.toggle("hidden", method !== "card");

  if (method === "card") payButton.textContent = "Pay now";
  if (method === "transfer") payButton.textContent = "Confirm transfer";
  if (method === "delivery") payButton.textContent = "Place order";
}

document.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
  input.addEventListener("change", updatePaymentMethod);
});

closePayment.addEventListener("click", closePaymentModal);
paymentOverlay.addEventListener("click", closePaymentModal);

let deliveryCoordinates = null;

useLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = "Location access is not supported by this browser.";
    return;
  }

  useLocationButton.disabled = true;
  useLocationButton.classList.add("loading");
  useLocationButton.querySelector("span").textContent = "Getting location...";
  locationStatus.textContent = "Waiting for browser permission...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      deliveryCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: Math.round(position.coords.accuracy)
      };
      useLocationButton.disabled = false;
      useLocationButton.classList.remove("loading");
      useLocationButton.querySelector("span").textContent = "Location added";
      locationStatus.textContent = `Location captured (${deliveryCoordinates.latitude.toFixed(5)}, ${deliveryCoordinates.longitude.toFixed(5)}).`;
    },
    (error) => {
      const messages = {
        1: "Location permission was denied. Enter the delivery address manually.",
        2: "Your location could not be determined. Enter the delivery address manually.",
        3: "Location lookup timed out. Try again or enter the address manually."
      };
      useLocationButton.disabled = false;
      useLocationButton.classList.remove("loading");
      useLocationButton.querySelector("span").textContent = "Use my current location";
      locationStatus.textContent = messages[error.code] || "Unable to access location.";
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
});

document.getElementById("cardNumber").addEventListener("input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 16);
  event.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
});

document.getElementById("cardExpiry").addEventListener("input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
  event.target.value = digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
});

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const method = paymentForm.querySelector('input[name="paymentMethod"]:checked').value;
  const deliveryName = document.getElementById("deliveryName").value.trim();
  const deliveryPhone = document.getElementById("deliveryPhone").value.trim();
  const deliveryAddress = document.getElementById("deliveryAddress").value.trim();

  if (!deliveryName || !deliveryPhone || !deliveryAddress) {
    showToast("Please enter delivery name, phone number and address");
    return;
  }

  if (method === "card") {
    const cardName = document.getElementById("cardName").value.trim();
    const cardNumber = document.getElementById("cardNumber").value.replace(/\D/g, "");
    const cardExpiry = document.getElementById("cardExpiry").value;
    const cardCvv = document.getElementById("cardCvv").value;

    if (!cardName || cardNumber.length !== 16 || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry) || cardCvv.length < 3) {
      showToast("Please enter valid demo card details");
      return;
    }
  }

  payButton.disabled = true;
  payButton.textContent = "Processing...";
  window.setTimeout(() => {
    const orderDetails = {
      customerName: deliveryName,
      phone: deliveryPhone,
      address: deliveryAddress,
      coordinates: deliveryCoordinates,
      paymentMethod: method,
      placedAt: new Date().toISOString()
    };
    sessionStorage.setItem("latestOrderLocation", JSON.stringify(orderDetails));

    const successMessage = method === "delivery"
      ? "Order placed! Pay when it arrives."
      : "Payment completed successfully!";
    cart = {};
    saveCart();
    renderCart();
    paymentForm.reset();
    updatePaymentMethod();
    deliveryCoordinates = null;
    useLocationButton.querySelector("span").textContent = "Use my current location";
    locationStatus.textContent = "Location is optional. Enter an address to continue.";
    payButton.disabled = false;
    closePaymentModal();
    showToast(successMessage);
  }, 700);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && paymentModal.classList.contains("open")) {
    closePaymentModal();
  }
});

document.getElementById("offerBtn").addEventListener("click", () => {
  showToast("Welcome offer ER20 added");
});

const menuButton = document.getElementById("menuButton");
const navLinks = document.querySelector(".nav-links");
menuButton.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

renderCart();
