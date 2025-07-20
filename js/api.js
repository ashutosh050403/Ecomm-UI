const BASE_URL = "http://localhost:8086";


let currentPage = 0;
let currentCategory = null;
const pageSize = 3;

function handleSearch(event) {
    // Prevent the form from reloading the page
    event.preventDefault(); 
    
    const query = document.getElementById('search-input').value.toLowerCase();
    
    // Get all product cards from the page
    const productCards = document.querySelectorAll('.col-lg-4');

    productCards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const description = card.querySelector('.card-text').textContent.toLowerCase(); // Category might be in the description
        
        // If the query matches the title or description, show the card. Otherwise, hide it.
        if (title.includes(query) || description.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}


    async function loadProducts(page = 0, category = currentCategory) {
    currentPage = page;
    currentCategory = category;

    // Update the active state of the filter buttons
    updateFilterButtons(category);

    try {
        // Build the URL dynamically based on whether a category is selected
        let url = `${BASE_URL}/products?page=${page}&size=${pageSize}`;
        if (category) {
            url = `${BASE_URL}/products/category/${category}?page=${page}&size=${pageSize}`;
        }

        const response = await fetch(url);
        const pageData = await response.json();
        
        const products = pageData.content;
        
        let allProductsContainer = document.getElementById("product-list");
        if (!allProductsContainer) return;
        
        allProductsContainer.innerHTML = ""; // Clear previous products

        if (products.length === 0) {
            allProductsContainer.innerHTML = "<p class='text-center'>No products found in this category.</p>";
        } else {
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
                allProductsContainer.innerHTML += productCard;
            });
        }
        
        renderPaginationControls(pageData);

    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

function renderPaginationControls(pageData) {
    const paginationContainer = document.getElementById("pagination-controls");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const totalPages = pageData.totalPages;
    const currentPage = pageData.number;

    // Previous button
    if (!pageData.first) {
        // Note: The onclick now includes the currentCategory
        paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadProducts(${currentPage - 1}, currentCategory)">Previous</a></li>`;
    }

    // Page number buttons
    for (let i = 0; i < totalPages; i++) {
        paginationContainer.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" onclick="loadProducts(${i}, currentCategory)">${i + 1}</a></li>`;
    }

    // Next button
    if (!pageData.last) {
        paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadProducts(${currentPage + 1}, currentCategory)">Next</a></li>`;
    }
}

// This new function handles the visual state of the filter buttons
function updateFilterButtons(category) {
    const buttons = document.querySelectorAll("#category-filters button");
    buttons.forEach(button => {
        button.classList.remove("active");
        // Check button text content to find the matching button
        if ((!category && button.textContent === "All Products") || (category && button.textContent.includes(category))) {
            button.classList.add("active");
        }
    });
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