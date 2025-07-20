

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function loadCart() {
    let cartItems = document.getElementById("cart-items");
    if (!cartItems) {
        return; // Exit if the cart items element isn't on the current page
    }

    let totalAmount = 0;
    cartItems.innerHTML = "";

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        cartItems.innerHTML += `
            <tr>
                <td><img src="${item.imageUrl}" width="50"></td>
                <td>${item.name}</td>
                <td>₹${item.price}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index}, -1)">-</button>
                    ${item.quantity}
                    <button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index}, 1)">+</button>
                </td>
                <td>₹${itemTotal.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">X</button></td>
            </tr>
        `;
    });
    document.getElementById("total-amount").innerText = totalAmount.toFixed(2);
}

function addToCart(id, name, price, imageUrl) {
    console.log("Adding product to cart:", id, name, price, imageUrl);

    price = parseFloat(price);
    let itemIndex = cart.findIndex((item) => item.id === id);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            imageUrl: imageUrl,
            quantity: 1
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCounter();
}

function updateCartCounter() {
    const cartBadge = document.querySelector(".cart-badge");
    if (cartBadge) {
        cartBadge.innerText = cart.length;
    }
}

function changeQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
        updateCartCounter();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    updateCartCounter();
}

async function checkout() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in to proceed with your order.");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return;
    }

    const productQuantities = cart.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
    }, {});

    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    try {
        const response = await fetch(`${BASE_URL}/orders/place`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ productQuantities, totalAmount }),
        });

        if (!response.ok) {
            throw new Error("Failed to place order.");
        }

        const data = await response.json();
        alert("Order placed successfully!");
        localStorage.removeItem("cart");
        window.location.href = "index.html";

    } catch (error) {
        console.error("Checkout error:", error);
        alert("An error occurred during checkout. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    updateCartCounter();
});