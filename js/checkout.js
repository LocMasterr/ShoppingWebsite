/**
 * =========================================================
 * MODULE THANH TOÁN & XÁC NHẬN ĐƠN HÀNG (js/checkout.js)
 * =========================================================
 * Nhiệm vụ:
 * 1. Tự động gắn cửa sổ Thanh toán mô phỏng vào mọi trang
 * 2. Cung cấp nút "Điền nhanh thông tin mẫu (Demo)" cho khách quét QR tại buổi Poster
 * 3. Kiểm tra hợp lệ dữ liệu và xuất màn hình Xác nhận đơn hàng kèm mã đơn GTS-XXXXXX
 */

const CheckoutModule = (function () {
  const paymentDescriptions = {
    "Thanh toán khi nhận hàng (Demo)":
      "Mô phỏng: Khách hàng kiểm tra sản phẩm khi nhận và thanh toán giả lập (Không thu tiền thật).",
    "Chuyển khoản ngân hàng (Mô phỏng)":
      "Mô phỏng: Hệ thống ghi nhận trạng thái chuyển khoản thử nghiệm mà không yêu cầu số tài khoản hay giao dịch thật.",
    "Ví điện tử (Demo)":
      "Mô phỏng: Trải nghiệm luồng chọn ví điện tử dành cho sinh viên (Không kết nối ví thật, không yêu cầu OTP)."
  };

  function injectCheckoutModalHTML() {
    if (document.getElementById("checkoutModal")) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="modal-container" id="checkoutModal" role="dialog" aria-modal="true" aria-label="Thanh toán đơn hàng">
        <div class="modal-box checkout-modal-box">
          <button type="button" class="modal-close-btn" id="closeCheckoutModalBtn" aria-label="Đóng">✕</button>

          <!-- Màn hình 1: Biểu mẫu nhập thông tin đặt hàng giả lập -->
          <div id="checkoutFormView">
            <h2 style="margin-bottom:12px;">Thanh toán đơn hàng (Chế độ mô phỏng)</h2>
            <div class="demo-alert">
              ⚠️ <strong>Lưu ý quan trọng:</strong> Đây là website mô phỏng phục vụ đồ án học tập. Vui lòng chỉ sử dụng thông tin giả, không nhập thông tin cá nhân thật.
              <div style="margin-top:8px;">
                <button type="button" class="btn btn-secondary btn-sm" id="fillDemoDataBtn">⚡ Điền nhanh thông tin mẫu (Demo)</button>
              </div>
            </div>

            <form id="checkoutForm" novalidate>
              <div class="checkout-grid">
                <div>
                  <h3 style="margin-bottom:14px; font-size:1.1rem;">1. Thông tin người nhận (Giả lập)</h3>
                  <div class="form-group">
                    <label for="custName">Tên người nhận (tên giả) *</label>
                    <input type="text" id="custName" class="form-control" placeholder="VD: Nguyễn Văn A (Khách thử)">
                    <div class="form-error">Vui lòng nhập tên người nhận giả lập (tối thiểu 2 ký tự).</div>
                  </div>
                  <div class="form-group">
                    <label for="custPhone">Số điện thoại (số giả 9–11 chữ số) *</label>
                    <input type="tel" id="custPhone" class="form-control" placeholder="VD: 0900123456">
                    <div class="form-error">Vui lòng nhập số điện thoại giả hợp lệ (9–11 chữ số).</div>
                  </div>
                  <div class="form-group">
                    <label for="custAddress">Địa chỉ giao hàng mẫu *</label>
                    <input type="text" id="custAddress" class="form-control" placeholder="VD: Ký túc xá Khu B / Cơ sở Nguyễn Văn Cừ">
                    <div class="form-error">Vui lòng nhập địa chỉ giao hàng mẫu (tối thiểu 5 ký tự).</div>
                  </div>
                  <div class="form-group">
                    <label for="custNote">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea id="custNote" class="form-control" rows="2" placeholder="VD: Giao giờ ra chơi tại lớp..."></textarea>
                  </div>
                </div>

                <div>
                  <h3 style="margin-bottom:14px; font-size:1.1rem;">2. Phương thức thanh toán (Demo)</h3>
                  <label class="payment-option selected">
                    <input type="radio" name="paymentMethod" value="Thanh toán khi nhận hàng (Demo)" checked>
                    <div>
                      <strong>Thanh toán khi nhận hàng (Demo)</strong>
                      <div style="font-size:0.8rem; color:var(--text-secondary);">Nhận hàng và thanh toán giả lập trực tiếp.</div>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input type="radio" name="paymentMethod" value="Chuyển khoản ngân hàng (Mô phỏng)">
                    <div>
                      <strong>Chuyển khoản ngân hàng (Mô phỏng)</strong>
                      <div style="font-size:0.8rem; color:var(--text-secondary);">Mô phỏng chuyển khoản (không kết nối ngân hàng).</div>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input type="radio" name="paymentMethod" value="Ví điện tử (Demo)">
                    <div>
                      <strong>Ví điện tử (Demo)</strong>
                      <div style="font-size:0.8rem; color:var(--text-secondary);">Mô phỏng thanh toán qua ví điện tử sinh viên.</div>
                    </div>
                  </label>

                  <div id="paymentMethodDesc" style="background:var(--bg-primary); border:1px solid var(--border-color); padding:10px 12px; border-radius:var(--radius-sm); font-size:0.82rem; color:var(--yellow-primary); margin-bottom:16px;">
                    Mô phỏng: Khách hàng kiểm tra sản phẩm khi nhận và thanh toán giả lập (Không thu tiền thật).
                  </div>

                  <h3 style="margin-bottom:10px; font-size:1.1rem;">3. Tóm tắt đơn hàng</h3>
                  <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:14px; margin-bottom:16px;">
                    <div id="checkoutOrderItems"></div>
                    <hr style="border:none; border-top:1px solid var(--border-color); margin:10px 0;">
                    <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:6px;">
                      <span>Tạm tính:</span>
                      <span id="checkoutSubtotal">0đ</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:8px;">
                      <span>Phí vận chuyển (Sinh viên):</span>
                      <span style="color:var(--success);">0đ (Miễn phí)</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:1.15rem; font-weight:800; color:var(--yellow-primary);">
                      <span>Tổng cộng:</span>
                      <span id="checkoutFinalTotal">0đ</span>
                    </div>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width:100%;">XÁC NHẬN ĐẶT HÀNG</button>
                </div>
              </div>
            </form>
          </div>

          <!-- Màn hình 2: Xác nhận đặt hàng thành công -->
          <div id="checkoutSuccessView" style="display:none; text-align:center; padding:16px 0;">
            <div style="font-size:3rem; margin-bottom:8px;">🎉</div>
            <h2 style="color:var(--success); margin-bottom:6px;">ĐẶT HÀNG THÀNH CÔNG!</h2>
            <p style="color:var(--text-secondary);">Cảm ơn bạn đã trải nghiệm Gay Tech Store.</p>
            <div id="orderConfirmationDetails"></div>
            <div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap; margin-top:20px;">
              <button type="button" class="btn btn-primary" id="continueAfterOrderBtn">Tiếp tục mua sắm</button>
              <a href="index.html" class="btn btn-secondary">Quay về trang chủ</a>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);
  }

  function renderSummary() {
    const items = CartModule.getItems();
    const subtotal = CartModule.getSubtotal();
    const listEl = document.getElementById("checkoutOrderItems");
    if (!listEl) return;

    listEl.innerHTML = items
      .map(
        (item) => `
        <div style="display:flex; justify-content:space-between; gap:10px; font-size:0.88rem; margin-bottom:8px;">
          <span>${item.name} <strong>(×${item.quantity})</strong></span>
          <span style="color:var(--yellow-primary); font-weight:700;">${CartModule.formatVND(item.price * item.quantity)}</span>
        </div>
      `
      )
      .join("");

    document.getElementById("checkoutSubtotal").textContent = CartModule.formatVND(subtotal);
    document.getElementById("checkoutFinalTotal").textContent = CartModule.formatVND(subtotal);
  }

  function openModal() {
    if (CartModule.getCount() === 0) {
      CartModule.showToast("Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước!");
      return;
    }
    CartModule.closeDrawer();
    document.getElementById("checkoutFormView").style.display = "block";
    document.getElementById("checkoutSuccessView").style.display = "none";
    renderSummary();
    document.getElementById("checkoutModal")?.classList.add("open");
  }

  function closeModal() {
    document.getElementById("checkoutModal")?.classList.remove("open");
  }

  function init() {
    injectCheckoutModalHTML();

    const modalEl = document.getElementById("checkoutModal");
    modalEl?.addEventListener("click", (e) => {
      if (e.target === modalEl) closeModal();
    });

    document.getElementById("closeCheckoutModalBtn")?.addEventListener("click", closeModal);
    document.getElementById("continueAfterOrderBtn")?.addEventListener("click", closeModal);

    // Nút điền nhanh dữ liệu giả lập
    document.getElementById("fillDemoDataBtn")?.addEventListener("click", () => {
      document.getElementById("custName").value = "Sinh Viên Thử Nghiệm (Demo)";
      document.getElementById("custPhone").value = "0900123456";
      document.getElementById("custAddress").value = "Phòng Poster CSC00004 - ĐH Khoa học Tự nhiên";
      document.getElementById("custNote").value = "Đơn hàng thử nghiệm tại buổi trình bày poster.";
      document.querySelectorAll("#checkoutForm .form-group").forEach((g) => g.classList.remove("invalid"));
      CartModule.showToast("Đã điền thông tin mẫu (Demo)!");
    });

    // Đổi mô tả khi chọn phương thức thanh toán
    document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        document.querySelectorAll(".payment-option").forEach((opt) => opt.classList.remove("selected"));
        radio.closest(".payment-option").classList.add("selected");
        const descEl = document.getElementById("paymentMethodDesc");
        if (descEl) descEl.textContent = paymentDescriptions[radio.value] || "";
      });
    });

    // Xử lý xác nhận đặt hàng
    document.getElementById("checkoutForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("custName");
      const phoneInput = document.getElementById("custPhone");
      const addrInput = document.getElementById("custAddress");

      let isValid = true;
      const checkField = (input, condition) => {
        const grp = input.closest(".form-group");
        if (!condition) {
          grp.classList.add("invalid");
          isValid = false;
        } else {
          grp.classList.remove("invalid");
        }
      };

      checkField(nameInput, nameInput.value.trim().length >= 2);
      checkField(phoneInput, /^[0-9]{9,11}$/.test(phoneInput.value.trim()));
      checkField(addrInput, addrInput.value.trim().length >= 5);

      if (!isValid) {
        CartModule.showToast("Vui lòng kiểm tra lại các trường thông tin được đánh dấu đỏ.");
        return;
      }

      const selectedPayment =
        document.querySelector('input[name="paymentMethod"]:checked')?.value ||
        "Thanh toán khi nhận hàng (Demo)";
      const orderId = "GTS-" + Math.floor(100000 + Math.random() * 900000);
      const orderedItems = CartModule.getItems();
      const finalTotal = CartModule.getSubtotal();

      document.getElementById("orderConfirmationDetails").innerHTML = `
        <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:18px; margin:18px 0; text-align:left;">
          <p><strong>Mã đơn hàng:</strong> <span style="color:var(--yellow-primary);">${orderId}</span></p>
          <p><strong>Trạng thái:</strong> <span style="color:var(--success); font-weight:700;">Đơn hàng mô phỏng</span></p>
          <p><strong>Người nhận (Giả lập):</strong> ${nameInput.value.trim()}</p>
          <p><strong>Số điện thoại (Giả lập):</strong> ${phoneInput.value.trim()}</p>
          <p><strong>Địa chỉ nhận mẫu:</strong> ${addrInput.value.trim()}</p>
          <p><strong>Phương thức thanh toán:</strong> ${selectedPayment}</p>
          <hr style="border:none; border-top:1px solid var(--border-color); margin:12px 0;">
          <div style="margin-bottom:10px;">
            ${orderedItems
              .map(
                (i) =>
                  `<div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:4px;">
                    <span>${i.name} × ${i.quantity}</span>
                    <span>${CartModule.formatVND(i.price * i.quantity)}</span>
                  </div>`
              )
              .join("")}
          </div>
          <div style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:800; color:var(--yellow-primary); padding-top:8px; border-top:1px solid var(--border-color);">
            <span>Tổng thanh toán (Mô phỏng):</span>
            <span>${CartModule.formatVND(finalTotal)}</span>
          </div>
        </div>
      `;

      CartModule.clear();
      e.target.reset();
      document.getElementById("checkoutFormView").style.display = "none";
      document.getElementById("checkoutSuccessView").style.display = "block";
      CartModule.showToast("Đặt hàng mô phỏng thành công!");
    });
  }

  return { init, openModal, closeModal };
})();