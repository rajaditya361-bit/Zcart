

async function loadProducts() {
    try {
        const response = await fetch("/api/products");
        const data = await response.json();
        window.zcartProducts = data.products;

        if (!data.success) return;

        const grid = document.getElementById("productGrid");

        data.products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product";

            card.innerHTML = `
                <div class="product-image">🛍️</div>
                <div class="product-name" onclick="showProductDetails('${product.id}')" style="cursor:pointer;">${product.name}</div>
                <div class="rating">★ ${product.rating || 0}</div>
                <div class="price">
                    ₹${Number(product.price).toLocaleString("en-IN")}
                </div>
                <br>
                <button class="add-cart"
                    onclick="addToCart('${product.id}', '${product.sellerId || ""}', '${product.name.replace(/'/g, "\\'")}', ${product.price})">
                    Add to Cart
                </button>
            `;

            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Product loading failed:", error);
    }
}

loadProducts();
