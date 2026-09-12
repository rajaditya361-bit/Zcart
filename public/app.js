let banners = [
  { id: 1, title: "Welcome to ZCart", sub: "Special Offer on Mobiles - Tap to View!", category: "Mobiles", bg: "linear-gradient(135deg, #2575fc 0%, #6a11cb 100%)" },
  { id: 2, title: "Laptop Festival", sub: "Best Deals on High Performance Laptops", category: "Laptops", bg: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)" },
  { id: 3, title: "Fashion Trends", sub: "Flat 50% Off on Latest Clothing", category: "Fashion", bg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" }
];

let products = [
  { id: 1, name: "Smartphone X1", category: "Mobiles", price: "₹14,999", rating: "★ 4.2", icon: "fa-mobile-alt" },
  { id: 2, name: "Pro Laptop 15", category: "Laptops", price: "₹54,999", rating: "★ 4.6", icon: "fa-laptop" },
  { id: 3, name: "Stylish Jacket", category: "Fashion", price: "₹2,499", rating: "★ 4.5", icon: "fa-tshirt" }
];

let sellers = [
  { id: 101, name: "Rose Garden Electronics", phone: "+91 9876543210", status: "Active" },
  { id: 102, name: "Fashion Hub Bihar", phone: "+91 9123456789", status: "Active" }
];

let orders = [
  { id: "ORD-9011", customer: "Amit Kumar", total: "₹14,999", status: "Processing" },
  { id: "ORD-9012", customer: "Priya Singh", total: "₹2,499", status: "Shipped" }
];

let kycRequests = [
  { id: 1, name: "Rose Garden Electronics", docType: "Aadhaar / GST", status: "Pending" },
  { id: 2, name: "Tech Traders Sheikhpura", docType: "PAN Card", status: "Pending" }
];

let autoSlideTimer = null;
let currentBannerIndex = 0;

// Custom Theme Color Picker Logic
function setCustomColor(colorHex) {
  document.documentElement.style.setProperty('--primary-color', colorHex);
  const colorPicker = document.getElementById('primaryColorPicker');
  const hexCode = document.getElementById('colorHexCode');
  
  if (colorPicker) colorPicker.value = colorHex;
  if (hexCode) hexCode.innerText = colorHex.toUpperCase();
  
  localStorage.setItem('zcart_custom_color', colorHex);
}

function loadSavedTheme() {
  const savedColor = localStorage.getItem('zcart_custom_color') || '#1a73e8';
  setCustomColor(savedColor);
}

// Tab Switching Mechanism
function switchAdminTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  document.getElementById(tabId).classList.add('active-content');
  event.currentTarget.classList.add('active');
}

// Banners Logic with Auto-Slide
function renderBanners() {
  const slider = document.getElementById('bannerSlider');
  slider.innerHTML = '';
  banners.forEach((b, idx) => {
    let backgroundStyle = b.bg.startsWith('http') || b.bg.startsWith('/') 
      ? `background: url('${b.bg}') center/cover no-repeat` 
      : `background: ${b.bg}`;

    slider.innerHTML += `
      <div class="hero-banner" id="banner-${idx}" style="${backgroundStyle}" onclick="handleBannerClick('${b.category}')">
        <h2>${b.title}</h2>
        <p>${b.sub}</p>
        <span class="banner-tag">Category: ${b.category}</span>
      </div>
    `;
  });

  const list = document.getElementById('adminBannerList');
  if (list) {
    list.innerHTML = '';
    banners.forEach(b => {
      list.innerHTML += `<div class="admin-item-row"><span>${b.title}</span><button class="delete-btn" onclick="deleteBanner(${b.id})">Delete</button></div>`;
    });
  }

  startAutoSlide();
}

function startAutoSlide() {
  if (autoSlideTimer) clearInterval(autoSlideTimer);
  if (banners.length <= 1) return;

  autoSlideTimer = setInterval(() => {
    const slider = document.getElementById('bannerSlider');
    if (!slider) return;

    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    const bannerElem = document.getElementById(`banner-${currentBannerIndex}`);
    if (bannerElem) {
      slider.scrollTo({
        left: bannerElem.offsetLeft - 16,
        behavior: 'smooth'
      });
    }
  }, 3000);
}

function addBanner() {
  const title = document.getElementById('newBannerTitle').value;
  const sub = document.getElementById('newBannerSub').value;
  const category = document.getElementById('newBannerCategory').value;
  const bg = document.getElementById('newBannerBg').value || "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)";
  if (!title) return alert("Enter Title!");

  banners.push({ id: Date.now(), title, sub, category, bg });
  renderBanners();
}

function deleteBanner(id) {
  banners = banners.filter(b => b.id !== id);
  renderBanners();
}

// Products Logic
function renderProducts(items) {
  const grid = document.getElementById('productList');
  grid.innerHTML = '';
  items.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <i class="fas ${p.icon || 'fa-box'}" style="font-size: 45px; text-align: center; color: var(--primary-color); margin: 15px 0;"></i>
        <div class="product-title">${p.name}</div>
        <div class="product-rating">${p.rating}</div>
        <div class="product-price">${p.price}</div>
        <button class="add-cart-btn">Add to Cart</button>
      </div>
    `;
  });

  const adminList = document.getElementById('adminProductList');
  if(adminList) {
    adminList.innerHTML = '';
    products.forEach(p => {
      adminList.innerHTML += `<div class="admin-item-row"><span>${p.name} (${p.price})</span><button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button></div>`;
    });
  }
}

function addNewProduct() {
  const name = document.getElementById('pName').value;
  const category = document.getElementById('pCategory').value;
  const price = document.getElementById('pPrice').value;
  const rating = document.getElementById('pRating').value || "★ 4.0";
  if(!name || !price) return alert("Fill details!");

  products.push({ id: Date.now(), name, category, price, rating, icon: "fa-box" });
  renderProducts(products);
  alert("Product Added!");
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  renderProducts(products);
}

// Sellers Logic
function renderSellers() {
  const list = document.getElementById('adminSellerList');
  list.innerHTML = '';
  sellers.forEach(s => {
    list.innerHTML += `<div class="admin-item-row"><div><strong>${s.name}</strong><br><small>${s.phone}</small></div><span class="badge-active">${s.status}</span></div>`;
  });
}

function addSeller() {
  const name = document.getElementById('sellerName').value;
  const phone = document.getElementById('sellerPhone').value;
  if(!name) return alert("Enter store name!");
  sellers.push({ id: Date.now(), name, phone, status: "Active" });
  renderSellers();
}

// Orders Logic
function renderOrders() {
  const list = document.getElementById('adminOrderList');
  list.innerHTML = '';
  orders.forEach(o => {
    list.innerHTML += `<div class="admin-item-row"><div><strong>${o.id}</strong> - ${o.customer}<br><small>Total: ${o.total}</small></div><span class="badge-order">${o.status}</span></div>`;
  });
}

// KYC Logic
function renderKyc() {
  const list = document.getElementById('adminKycList');
  list.innerHTML = '';
  kycRequests.forEach(k => {
    list.innerHTML += `
      <div class="admin-item-row">
        <div><strong>${k.name}</strong><br><small>Doc: ${k.docType}</small></div>
        ${k.status === 'Pending' ? `<button class="admin-btn-primary" style="padding:4px 8px;font-size:11px;" onclick="approveKyc(${k.id})">Approve</button>` : `<span class="badge-active">Verified</span>`}
      </div>
    `;
  });
}

function approveKyc(id) {
  const item = kycRequests.find(k => k.id === id);
  if(item) item.status = "Verified";
  renderKyc();
}

function handleBannerClick(category) { filterCategory(category); }

function filterCategory(cat) {
  const header = document.getElementById('sectionHeader');
  if (cat === 'All') {
    header.innerText = "Deals of the Day";
    renderProducts(products);
  } else {
    header.innerText = cat + " Products";
    renderProducts(products.filter(p => p.category === cat));
  }
}

function toggleAdminModal() {
  const modal = document.getElementById('adminModal');
  modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
  renderBanners();
  renderProducts(products);
  renderSellers();
  renderOrders();
  renderKyc();
  loadSavedTheme();
}

document.addEventListener('DOMContentLoaded', () => {
  loadSavedTheme();
  renderBanners();
  renderProducts(products);
});
