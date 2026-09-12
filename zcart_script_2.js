

    let cart = JSON.parse(localStorage.getItem("zcart_cart")) || [];
    function saveCart() {
        localStorage.setItem("zcart_cart", JSON.stringify(cart));
    }


    function addToCart(productId, sellerId, name, price) {
        const existing = cart.find(item =>
            String(item.productId) === String(productId)
        );

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                productId: productId,
                sellerId: sellerId || "",
                name: name,
                price: Number(price),
                quantity: 1
            });
        }

        updateCart();
        saveCart();
        alert(name + " added to cart!");
    }

    function updateCart() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById("cartCount").innerText = count;

        const container = document.getElementById("cartItems");
        const totalElement = document.getElementById("cartTotal");

        if (cart.length === 0) {
            container.innerHTML = "<p>Your cart is empty.</p>";
            totalElement.innerText = "Total: ₹0";
            return;
        }

        let total = 0;

        container.innerHTML = cart.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            return `
                <div style="padding:12px 0; border-bottom:1px solid #ddd;">
                    <strong>${item.name}</strong><br>
                    ₹${item.price.toLocaleString("en-IN")}
                    × ${item.quantity}
                    = ₹${itemTotal.toLocaleString("en-IN")}
                    <br>
                    <button onclick="changeQuantity(${index}, -1)">−</button>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                    <button onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
        }).join("");

        totalElement.innerText =
            "Total: ₹" + total.toLocaleString("en-IN");
    }

    function changeQuantity(index, amount) {
        cart[index].quantity += amount;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        updateCart();
        saveCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
        saveCart();
    }

    function showCart() {
        updateCart();
        saveCart();
        document.getElementById("cartModal").style.display = "block";
    }

    function closeCart() {
        document.getElementById("cartModal").style.display = "none";
    }
function searchProducts() {
    const searchText = document.getElementById("searchInput").value.toLowerCase().trim();
    const products = document.querySelectorAll(".product");
    let found = 0;

    products.forEach(product => {
        const name = product.querySelector(".product-name");
        if (!name) return;
        const match = name.innerText.toLowerCase().includes(searchText);
        product.style.display = match ? "" : "none";
        if (match) found++;
    });

    let box = document.getElementById("searchResults");
    if (box) box.innerText = searchText ? (found ? "Search Results for: " + searchText + " (" + found + " found)" : "No products found for: " + searchText) : "";
}

function filterCategory(category) {
    const products = document.querySelectorAll(".product");
    products.forEach(product => {
        const c = product.getAttribute("data-category");
        product.style.display = (category === "all" || c === category) ? "" : "none";
    });
    document.getElementById("searchInput").value = "";
}


function buyNow(id) {
    const product = (window.zcartProducts || []).find(p =>
        String(p.id || p._id) === String(id)
    );

    if (!product) {
        alert("Product not found!");
        return;
    }

    cart = [{
        name: product.name,
        price: Number(product.price) || 0,
        quantity: 1
    }];

    openCheckout();
}

function openCheckout() {
    if (!cart || cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const summary = document.getElementById("checkoutSummary");

    summary.innerHTML = `
        <div style="padding:10px;background:#f5f5f5;border-radius:8px;margin-bottom:12px;">
            <b>Order Summary</b>
            ${cart.map(item => `
                <div style="margin-top:8px;">
                    ${item.name} × ${item.quantity}
                    — ₹${(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                </div>
            `).join("")}
            <hr>
            <b>Total: ₹${cart.reduce((sum, item) =>
                sum + Number(item.price) * item.quantity, 0
            ).toLocaleString("en-IN")}</b>
        </div>
    `;

    document.getElementById("checkoutModal").style.display = "block";
}

function closeCheckout() {
    document.getElementById("checkoutModal").style.display = "none";
}

async function placeOrder() {
    if (!cart || cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const name = document.getElementById("checkoutName").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const address = document.getElementById("checkoutAddress").value.trim();
    const payment = document.getElementById("checkoutPayment").value;

    if (!name || !phone || !address || !payment) {
        alert("Please fill all checkout details.");
        return;
    }

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    productId: item.productId || "",
                    sellerId: item.sellerId || "",
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(item.quantity)
                })),
                name: name,
                phone: phone,
                address: address,
                payment: payment
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Order failed");
        }

        alert("Order placed successfully! 🎉\nOrder ID: " + data.order.id);

        cart = [];
        saveCart();
        updateCart();
        closeCheckout();
        closeCart();
        closeProductDetails();

    } catch (error) {
        console.error(error);
        alert("Unable to place order. Please try again.");
    }
}

function closeProductDetails() {
    document.getElementById("productModal").style.display = "none";
}

async function showProductDetails(id) {
    const details = document.getElementById("productDetails");
    const modal = document.getElementById("productModal");

    modal.style.display = "block";
    details.innerHTML = "<h2>Product Details</h2><p>Loading product...</p>";

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const data = await response.json();
        const products = data.products || data;

        const product = products.find(p =>
            String(p._id || p.id) === String(id) ||
            String(p.name) === String(id)
        );

        if (!product) {
            details.innerHTML =
                "<h2>Product Details</h2><p>Product not found.</p>";
            return;
        }

        const safeName = String(product.name || "Product")
            .replace(/'/g, "\\'");

        details.innerHTML = `
            <h2>${product.name || "Product"}</h2>

            <img src="${product.image || ""}"
                 style="max-width:300px;width:100%;border-radius:10px;">

            <h3>₹${product.price || 0}</h3>

            <p>${product.description || "No description available."}</p>

            <p>
                <b>Category:</b>
                ${product.category || "N/A"}
            </p>

            <button onclick="addToCart('${product.id}', '${product.sellerId || ""}', '${safeName}', ${Number(product.price) || 0})">
                Add to Cart
            </button>

            <button onclick="buyNow('${product.id}')"
                    style="margin-left:8px;">
                Buy Now
            </button>
        `;
    } catch (error) {
        console.error(error);

        details.innerHTML =
            "<h2>Product Details</h2><p>Unable to load product details.</p>";
    }
}
async function showMyOrders() {
  const modal = document.getElementById("ordersModal");
  const list = document.getElementById("ordersList");

  modal.style.display = "block";
  list.innerHTML = "Loading orders...";

  try {
    const response = await fetch("/api/orders");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load orders");
    }

    if (!data.orders || data.orders.length === 0) {
      list.innerHTML = "<p>No orders found.</p>";
      return;
    }

    list.innerHTML = data.orders.slice().reverse().map(order => `
      <div style="border:1px solid #ddd; padding:15px; margin:10px 0; border-radius:10px;">
        <h3>Order ID: ${order.id}</h3>
        <p><b>Status:</b> ${order.status}</p>
        <p><b>Payment:</b> ${order.payment}</p>
        <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString("en-IN")}</p>
        ${order.items ? order.items.map(item => `
          <div style="padding:8px 0; border-top:1px solid #eee;">
            ${item.name} × ${item.quantity} — ₹${(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
          </div>
        `).join("") : `
          <div style="padding:8px 0; border-top:1px solid #eee;">
            ${order.product} × ${order.quantity} — ₹${Number(order.price || 0).toLocaleString("en-IN")}
          </div>
        `}
        <h3>Total: ₹${Number(order.total || (order.price || 0) * (order.quantity || 1)).toLocaleString("en-IN")}</h3>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    list.innerHTML = "<p>Unable to load orders. Please try again.</p>";
  }
}

function closeMyOrders() {
  document.getElementById("ordersModal").style.display = "none";
}


function showCustomerLogin() {
  document.getElementById("customerLoginModal").style.display = "block";
  document.getElementById("customerLoginMessage").textContent = "";
}

function closeCustomerLogin() {
  document.getElementById("customerLoginModal").style.display = "none";
}

function showCustomerSignup() {
  closeCustomerLogin();
  document.getElementById("customerSignupModal").style.display = "block";
  document.getElementById("customerSignupMessage").textContent = "";
}

function closeCustomerSignup() {
  document.getElementById("customerSignupModal").style.display = "none";
}

async function customerSignup() {
  const name = document.getElementById("customerSignupName").value.trim();
  const email = document.getElementById("customerSignupEmail").value.trim();
  const phone = document.getElementById("customerSignupPhone").value.trim();
  const password = document.getElementById("customerSignupPassword").value;
  const confirmPassword = document.getElementById("customerSignupConfirmPassword").value;
  const message = document.getElementById("customerSignupMessage");

  if (!name || !email || !phone || !password || !confirmPassword) {
    message.textContent = "Sabhi fields bharna zaroori hai.";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "Password match nahi kar raha.";
    return;
  }

  message.textContent = "Creating account...";

  try {
    const response = await fetch("/api/customer/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      message.textContent = data.message || "Registration failed";
      return;
    }

    alert("Customer account successfully created!");

    closeCustomerSignup();
    showCustomerLogin();

    document.getElementById("customerEmail").value = email;
    document.getElementById("customerPassword").value = "";

  } catch (error) {
    console.error(error);
    message.textContent = "Server se connection nahi ho raha.";
  }
}

async function customerLogin() {
  const email = document.getElementById("customerEmail").value.trim();
  const password = document.getElementById("customerPassword").value;
  const message = document.getElementById("customerLoginMessage");

  if (!email || !password) {
    message.textContent = "Email aur password required hai.";
    return;
  }

  message.textContent = "Logging in...";

  try {
    const response = await fetch("/api/customer/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      message.textContent = data.message || "Login failed";
      return;
    }

    window.currentCustomer = data.customer;

    closeCustomerLogin();

    alert("Customer login successful!");

  } catch (error) {
    console.error(error);
    message.textContent = "Server se connection nahi ho raha.";
  }
}

function showSellerLogin() {
  document.getElementById("sellerLoginModal").style.display = "block";
  document.getElementById("sellerLoginMessage").textContent = "";
}

function closeSellerLogin() {
  document.getElementById("sellerLoginModal").style.display = "none";
}

async function sellerLogin() {
  const email = document.getElementById("sellerEmail").value.trim();
  const password = document.getElementById("sellerPassword").value;

  const message = document.getElementById("sellerLoginMessage");

  if (!email || !password) {
    message.textContent = "Email aur password required hai.";
    return;
  }

  message.textContent = "Logging in...";

  try {
    const response = await fetch("/api/seller/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      message.textContent = data.message || "Login failed";
      return;
    }

    window.currentSeller = data.seller;

    closeSellerLogin();
    showSellerDashboard();

  } catch (error) {
    console.error(error);
    message.textContent = "Server se connection nahi ho raha.";
  }
}

function showSellerDashboard() {
  const seller = window.currentSeller;

  if (!seller) {
    showSellerLogin();
    return;
  }

  document.getElementById("sellerInfo").innerHTML = `
    <p><b>Name:</b> ${seller.name || ""}</p>
    <p><b>Email:</b> ${seller.email || ""}</p>
    <p><b>Phone:</b> ${seller.phone || ""}</p>
    <p><b>Status:</b> ${seller.status || ""}</p>
  `;

  document.getElementById("sellerDashboardModal").style.display = "block";

  loadSellerProducts();
  loadSellerOrders();
}



function showSellerAddProduct() {
  const seller = window.currentSeller;

  if (!seller) {
    showSellerLogin();
    return;
  }

  document.getElementById("addProductName").value = "";
  document.getElementById("addProductPrice").value = "";
  document.getElementById("addProductCategory").value = "";
  document.getElementById("addProductDescription").value = "";
  document.getElementById("addProductImage").value = "";
  document.getElementById("addProductStock").value = "";
  document.getElementById("sellerAddProductMessage").textContent = "";

  document.getElementById("sellerAddProductModal").style.display = "block";
}

function closeSellerAddProduct() {
  document.getElementById("sellerAddProductModal").style.display = "none";
}

async function saveSellerNewProduct() {
  const seller = window.currentSeller;

  if (!seller) {
    showSellerLogin();
    return;
  }

  const message = document.getElementById("sellerAddProductMessage");

  const name = document.getElementById("addProductName").value.trim();
  const price = document.getElementById("addProductPrice").value;
  const category = document.getElementById("addProductCategory").value.trim();
  const description = document.getElementById("addProductDescription").value.trim();
  const image = document.getElementById("addProductImage").value.trim();
  const stock = document.getElementById("addProductStock").value;

  if (!name || price === "") {
    message.textContent = "Product name aur price required hai.";
    return;
  }

  message.textContent = "Adding product...";

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sellerId: seller.id,
        name,
        price: Number(price),
        category,
        description,
        image,
        stock: Number(stock || 0)
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Product add failed");
    }

    alert("Product added successfully!");

    closeSellerAddProduct();
    loadSellerProducts();

  } catch (error) {
    console.error(error);
    message.textContent = error.message || "Unable to add product.";
  }
}

let editingSellerProductId = null;

function editSellerProduct(productId) {
  const seller = window.currentSeller;

  if (!seller) {
    showSellerLogin();
    return;
  }

  const product = (window.sellerProducts || []).find(
    p => String(p.id) === String(productId)
  );

  if (!product) {
    alert("Product not found!");
    return;
  }

  editingSellerProductId = productId;

  document.getElementById("editProductName").value = product.name || "";
  document.getElementById("editProductPrice").value = product.price ?? "";
  document.getElementById("editProductCategory").value = product.category || "";
  document.getElementById("editProductDescription").value = product.description || "";
  document.getElementById("editProductImage").value = product.image || "";
  document.getElementById("editProductStock").value = product.stock ?? 0;

  document.getElementById("sellerEditProductMessage").textContent = "";
  document.getElementById("sellerEditProductModal").style.display = "block";
}

function closeSellerEditProduct() {
  document.getElementById("sellerEditProductModal").style.display = "none";
  editingSellerProductId = null;
}

async function saveSellerProductEdit() {
  const seller = window.currentSeller;

  if (!seller || !editingSellerProductId) return;

  const message = document.getElementById("sellerEditProductMessage");

  const name = document.getElementById("editProductName").value.trim();
  const price = document.getElementById("editProductPrice").value;
  const category = document.getElementById("editProductCategory").value.trim();
  const description = document.getElementById("editProductDescription").value.trim();
  const image = document.getElementById("editProductImage").value.trim();
  const stock = document.getElementById("editProductStock").value;

  if (!name || price === "") {
    message.textContent = "Product name aur price required hai.";
    return;
  }

  message.textContent = "Saving...";

  try {
    const response = await fetch(
      "/api/products/" + encodeURIComponent(editingSellerProductId),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sellerId: seller.id,
          name,
          price: Number(price),
          category,
          description,
          image,
          stock: Number(stock || 0)
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Product update failed");
    }

    alert("Product updated successfully!");

    closeSellerEditProduct();
    loadSellerProducts();

  } catch (error) {
    console.error(error);
    message.textContent = error.message || "Unable to update product.";
  }
}

async function deleteSellerProduct(productId) {
  const seller = window.currentSeller;

  if (!seller) {
    showSellerLogin();
    return;
  }

  if (!confirm("Kya aap is product ko delete karna chahte hain?")) {
    return;
  }

  try {
    const response = await fetch(
      "/api/products/" + encodeURIComponent(productId),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sellerId: seller.id
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Product delete failed");
    }

    alert("Product deleted successfully!");

    loadSellerProducts();

  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to delete product.");
  }
}

async function loadSellerProducts() {
  const box = document.getElementById("sellerProducts");
  const seller = window.currentSeller;

  if (!seller) return;

  box.innerHTML = "Loading products...";

  try {
    const response = await fetch(
      "/api/seller/" + encodeURIComponent(seller.id) + "/products"
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load products");
    }

    window.sellerProducts = data.products || [];

    if (!data.products || data.products.length === 0) {
      box.innerHTML = "<p>No products found.</p>";
      return;
    }

    box.innerHTML = data.products.map(product => `
      <div style="border:1px solid #ddd; padding:12px; margin:10px 0; border-radius:10px;">
        <b>${product.name || ""}</b>
        <p>Price: ₹${Number(product.price || 0).toLocaleString("en-IN")}</p>
        <p>Stock: ${product.stock ?? 0}</p>

        <button onclick="editSellerProduct('${product.id}')"
          style="padding:8px 12px; margin-right:5px;">
          ✏️ Edit
        </button>

        <button onclick="deleteSellerProduct('${product.id}')"
          style="padding:8px 12px;">
          🗑️ Delete
        </button>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    box.innerHTML = "<p>Unable to load products.</p>";
  }
}

async function loadSellerOrders() {
  const box = document.getElementById("sellerOrders");
  const seller = window.currentSeller;

  if (!seller) return;

  box.innerHTML = "Loading orders...";

  try {
    const response = await fetch(
      "/api/seller/" + encodeURIComponent(seller.id) + "/orders"
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load orders");
    }

    if (!data.orders || data.orders.length === 0) {
      box.innerHTML = "<p>No orders found.</p>";
      return;
    }

    box.innerHTML = data.orders.slice().reverse().map(order => `
      <div style="border:1px solid #ddd; padding:15px; margin:10px 0; border-radius:10px;">
        <h3>Order ID: ${order.id}</h3>
        <p><b>Customer:</b> ${order.name || ""}</p>
        <p><b>Phone:</b> ${order.phone || ""}</p>
        <p><b>Address:</b> ${order.address || ""}</p>
        <p><b>Payment:</b> ${order.payment || ""}</p>

        ${order.items.map(item => `
          <div style="padding:8px 0; border-top:1px solid #eee;">
            ${item.name} × ${item.quantity}
            — ₹${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}
          </div>
        `).join("")}

        <p><b>Status:</b> ${order.status || "Placed"}</p>

        <select id="status-${order.id}" style="padding:8px;">
          ${[
            "Placed",
            "Confirmed",
            "Packed",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
          ].map(status => `
            <option value="${status}" ${status === order.status ? "selected" : ""}>
              ${status}
            </option>
          `).join("")}
        </select>

        <button onclick="updateSellerOrderStatus('${order.id}')"
          style="padding:8px 12px; margin-left:5px;">
          Update Status
        </button>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    box.innerHTML = "<p>Unable to load orders.</p>";
  }
}

async function updateSellerOrderStatus(orderId) {
  const seller = window.currentSeller;
  const select = document.getElementById("status-" + orderId);

  if (!seller || !select) return;

  const status = select.value;

  try {
    const response = await fetch(
      "/api/seller/" +
      encodeURIComponent(seller.id) +
      "/orders/" +
      encodeURIComponent(orderId) +
      "/status",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Status update failed");
    }

    alert("Order status updated successfully!");
    loadSellerOrders();

  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to update order status.");
  }
}


function showSellerSignup() {
  closeSellerLogin();
  document.getElementById("sellerSignupModal").style.display = "block";
  document.getElementById("sellerSignupMessage").textContent = "";
}

function closeSellerSignup() {
  document.getElementById("sellerSignupModal").style.display = "none";
}

async function sellerSignup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;
  const message = document.getElementById("sellerSignupMessage");

  if (!name || !email || !phone || !password || !confirmPassword) {
    message.textContent = "Sabhi fields bharna zaroori hai.";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "Password match nahi kar raha.";
    return;
  }

  message.textContent = "Creating account...";

  try {
    const response = await fetch("/api/seller/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      message.textContent = data.message || "Registration failed";
      return;
    }

    alert("Seller account successfully created!");

    closeSellerSignup();
    showSellerLogin();

    document.getElementById("sellerEmail").value = email;
    document.getElementById("sellerPassword").value = "";

  } catch (error) {
    console.error(error);
    message.textContent = "Server se connection nahi ho raha.";
  }
}

function closeSellerDashboard() {
  document.getElementById("sellerDashboardModal").style.display = "none";
}
