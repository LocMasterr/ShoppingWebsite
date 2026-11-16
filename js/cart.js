/**
 * MODULE GIỎ HÀNG ĐÃ KHẮC PHỤC LỖI NHÂN ĐÔI (js/cart.js)
 */
const CartModule = (function () {
  const STORAGE_KEY = "gay_tech_store_cart_v1";
  let cart = loadCart();
  let singleBuyItem = null; // Lưu tạm khi khách bấm "Mua ngay 1 món"

  function formatVND(amount) {
    return Number(amount).toLocaleString("vi-VN") + "đ";
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {}
  }

  function showToast(message) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2500);
  }

  // Hỗ trợ lấy danh sách thanh toán (Ưu tiên món "Mua ngay" nếu có, nếu không thì lấy Giỏ hàng)
  function getCheckoutItems() {
    if (singleBuyItem) return [singleBuyItem];
    return [...cart];
  }

  function getCheckoutSubtotal() {
    const items = getCheckoutItems();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function setSingleBuyItem(productId, qty = 1) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return false;
    singleBuyItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categoryLabel: product.categoryLabel,
      quantity: Math.max(1, parseInt(qty, 10) || 1)
    };
    return true;
  }

  function clearSingleBuyItem() {
    singleBuyItem = null;
  }

  function isSingleBuyMode() {
    return singleBuyItem !== null;
  }

  function getItems() {
    return [...cart];
  }

  function getCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function add(productId, qty = 1) {
    clearSingleBuyItem();
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    const validQty = Math.max(1, parseInt(qty, 10) || 1);
    const existing = cart.find((item) => item.id === productId);

    if (existing) {
      existing.quantity += validQty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryLabel: product.categoryLabel,
        quantity: validQty
      });
    }

    saveCart();
    render();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }

  function updateQty(productId, delta) {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== productId);
      showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
    }
    saveCart();
    render();
  }

  function remove(productId) {
    cart = cart.filter((i) => i.id !== productId);
    saveCart();
    render();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
  }

  function clear() {
    cart = [];
    singleBuyItem = null;
    saveCart();
    render();
  }

  function injectCartDrawerHTML() {
    // Xóa khung cũ nếu bị trùng trong HTML để tránh nhân đôi sự kiện
    document.getElementById("cartDrawer")?.remove();
    document.getElementById("globalBackdrop")?.remove();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="overlay-backdrop" id="globalBackdrop"></div>
      <aside class="cart-drawer" id="cartDrawer" aria-label="Giỏ hàng của bạn">
        <div class="cart-drawer-header">
          <div>
            <h3>🛒 Giỏ hàng (<span id="cartTotalItemsText">0</span>)</h3>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" id="clearAllCartBtn" style="font-size:0.78rem; color:var(--error); font-weight:600; padding:4px 8px; border:1px solid var(--border-color); border-radius:6px;">Xóa hết</button>
            <button type="button" class="modal-close-btn" id="closeCartDrawerBtn" style="position:static;" aria-label="Đóng giỏ hàng">✕</button>
          </div>
        </div>
        <div class="cart-drawer-body" id="cartDrawerBody"></div>
        <div class="cart-drawer-footer" id="cartDrawerFooter">
          <div class="cart-summary-row">
            <span>Tạm tính:</span>
            <strong id="cartSubtotalValue">0đ</strong>
          </div>
          <div class="cart-summary-row">
            <span>Phí giao hàng (Ưu đãi SV):</span>
            <strong style="color:var(--success);">Miễn phí (0đ)</strong>
          </div>
          <div class="cart-summary-row cart-summary-total">
            <span>Tổng cộng:</span>
            <span id="cartTotalValue">0đ</span>
          </div>
          <div style="display:grid; gap:10px;">
            <button type="button" class="btn btn-primary" id="proceedToCheckoutBtn">TIẾN HÀNH ĐẶT HÀNG</button>
            <button type="button" class="btn btn-secondary btn-sm" id="continueShoppingBtn">Tiếp tục mua sắm</button>
          </div>
        </div>
      </aside>
    `;
    document.body.appendChild(wrapper);
  }

  function openDrawer() {
    clearSingleBuyItem();
    document.getElementById("cartDrawer")?.classList.add("open");
    document.getElementById("globalBackdrop")?.classList.add("open");
  }

  function closeDrawer() {
    document.getElementById("cartDrawer")?.classList.remove("open");
    document.getElementById("globalBackdrop")?.classList.remove("open");
  }

  function render() {
    const count = getCount();
    document.querySelectorAll(".js-cart-count").forEach((el) => {
      el.textContent = count;
    });

    const bodyEl = document.getElementById("cartDrawerBody");
    const footerEl = document.getElementById("cartDrawerFooter");
    const clearBtn = document.getElementById("clearAllCartBtn");
    const countTextEl = document.getElementById("cartTotalItemsText");

    if (countTextEl) countTextEl.textContent = `${count} món`;
    if (clearBtn) clearBtn.style.display = cart.length > 0 ? "inline-block" : "none";
    if (!bodyEl || !footerEl) return;

    if (cart.length === 0) {
      bodyEl.innerHTML = `
        <div class="empty-catalog-state" style="margin:auto 0;">
          <h3>Giỏ hàng của bạn đang trống.</h3>
          <p>Hãy chọn thiết bị gaming phù hợp với góc học tập và giải trí của bạn.</p>
          <button type="button" class="btn btn-primary btn-sm" id="emptyCartExploreBtn">KHÁM PHÁ SẢN PHẨM</button>
        </div>
      `;
      footerEl.style.display = "none";

      const exploreBtn = document.getElementById("emptyCartExploreBtn");
      if (exploreBtn) {
        exploreBtn.onclick = () => {
          closeDrawer();
          const catalogSec = document.getElementById("catalog");
          if (catalogSec) {
            catalogSec.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = "index.html#catalog";
          }
        };
      }
      return;
    }

    footerEl.style.display = "block";
    bodyEl.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <div class="cart-item-thumb">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">${formatVND(item.price)} × ${item.quantity} = ${formatVND(item.price * item.quantity)}</div>
            <div class="cart-item-controls">
              <div class="qty-Selector">
                <button type="button" data-action="dec" data-id="${item.id}" aria-label="Giảm số lượng">−</button>
                <input type="text" value="${item.quantity}" readonly aria-label="Số lượng">
                <button type="button" data-action="inc" data-id="${item.id}" aria-label="Tăng số lượng">+</button>
              </div>
              <button type="button" class="remove-item-btn" data-action="remove" data-id="${item.id}">Xóa</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    const subtotal = getSubtotal();
    document.getElementById("cartSubtotalValue").textContent = formatVND(subtotal);
    document.getElementById("cartTotalValue").textContent = formatVND(subtotal);
  }

  function init() {
    if (window.__GTS_CART_INIT__) return;
    window.__GTS_CART_INIT__ = true;

    injectCartDrawerHTML();
    render();

    document.querySelectorAll(".js-open-cart").forEach((btn) => {
      btn.onclick = openDrawer;
    });

    document.getElementById("closeCartDrawerBtn").onclick = closeDrawer;
    document.getElementById("continueShoppingBtn").onclick = closeDrawer;
    document.getElementById("globalBackdrop").onclick = closeDrawer;

    document.getElementById("clearAllCartBtn").onclick = () => {
      clear();
      showToast("Đã làm trống toàn bộ giỏ hàng.");
    };

    document.getElementById("cartDrawerBody").onclick = (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const { id, action } = btn.dataset;
      if (action === "inc") updateQty(id, 1);
      if (action === "dec") updateQty(id, -1);
      if (action === "remove") remove(id);
    };

    document.getElementById("proceedToCheckoutBtn").onclick = () => {
      clearSingleBuyItem();
      if (typeof CheckoutModule !== "undefined") {
        CheckoutModule.openModal();
      }
    };
  }

  return {
    init,
    add,
    updateQty,
    remove,
    clear,
    getItems,
    getCount,
    getSubtotal,
    getCheckoutItems,
    getCheckoutSubtotal,
    setSingleBuyItem,
    clearSingleBuyItem,
    isSingleBuyMode,
    openDrawer,
    closeDrawer,
    formatVND,
    showToast
  };
})();