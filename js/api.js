const BASE_URL = "http://localhost:8086";

async function loadProducts() {
    try {
        const response = await fetch(`${BASE_URL}/products`);
        const products = await response.json();
        
        let trendingList = document.getElementById("trending-products");
        let clothingList = document.getElementById("clothing-products");
        let electronicsList = document.getElementById("electronics-products");

        // Check if product list elements exist on the page before using them
        if (!trendingList || !clothingList || !electronicsList) {
            return; 
        }

        trendingList.innerHTML = "";
        clothingList.innerHTML = "";
        electronicsList.innerHTML = "";

        products.forEach((product) => {
            let productCard = `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card h-100">
                            <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text">${product.description}</p>
                                <p class="price"><strong>₹${product.price}</strong></p>
                                <button class="btn btn-primary mt-auto"
                                onclick="addToCart(${product.id}, '${product.name}',${product.price},'${product.imageUrl}')">
                                Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
            `;

            if (product.category === "Clothing") {
                clothingList.innerHTML += productCard;
            } else if (product.category === "Electronics") {
                electronicsList.innerHTML += productCard;
            } else {
                trendingList.innerHTML += productCard;
            }
        });

    } catch (error) {
        console.error("Error fetching products:", error);
    }
}
async function addProduct(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const product = {
        name: document.getElementById("name").value,
        price: parseFloat(document.getElementById("price").value),
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
        imageUrl: document.getElementById("imageUrl").value,
    };

    try {
        const response = await fetch(`${BASE_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(product),
        });

        if (response.ok) {
            alert("Product added successfully!");
            loadAdminProducts(); // Refresh the product list
        } else {
            alert("Failed to add product.");
        }
    } catch (error) {
        console.error("Error adding product:", error);
    }
}

async function loadAdminProducts() {
    try {
        const response = await fetch(`${BASE_URL}/products`);
        const products = await response.json();
        const productList = document.getElementById("admin-products-list");
        productList.innerHTML = "";

        products.forEach(product => {
            productList.innerHTML += `
                <tr>
                    <td><img src="${product.imageUrl}" width="50"></td>
                    <td>${product.name}</td>
                    <td>₹${product.price}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading admin products:", error);
    }
}

async function deleteProduct(id) {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            alert("Product deleted successfully!");
            loadAdminProducts(); // Refresh list
        } else {
            alert("Failed to delete product.");
        }
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}