document.addEventListener("DOMContentLoaded", function () {
    const productContainer = document.getElementById("products");
    const cartContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    let cart = [];

    // Charger les produits dynamiquement
    fetch("products.json")
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const productElement = document.createElement("div");
                productElement.classList.add("product");
                productElement.innerHTML = `
                    <img src="${product.cover}" alt="${product.category}">
                    <h3>${product.category}</h3>
                    <p>${product.description}</p>
                    <span>${product.price}€</span>
                    <button onclick="addToCart(${product.id}, '${product.category}', ${product.price})">Ajouter au panier</button>
                `;
                productContainer.appendChild(productElement);
            });
        });

    // Ajouter un produit au panier
    window.addToCart = function (id, name, price) {
        let item = cart.find(p => p.id === id);
        if (item) {
            item.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        updateCart();
    };

    // Mettre à jour l'affichage du panier
    function updateCart() {
        cartContainer.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const cartItem = document.createElement("li");
            cartItem.innerHTML = `<u>${item.name} x${item.quantity} - ${item.price * item.quantity}€</u>`;
            cartContainer.appendChild(cartItem);
        });
        cartTotal.textContent = `Total : ${total.toFixed(2)}€`;
    }
});
