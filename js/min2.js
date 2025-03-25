document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("products");
    const offcanvasContainer = document.body; // On ajoutera les offcanvas ici

    fetch("datas/products.json")
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const productHTML = `
                    <li key=${product.idProduit} class="col list-unstyled" type="button" data-bs-toggle="offcanvas" data-bs-target="#${product.idProduit}">
                        <div class="card shadow-sm ">
                            <div class="card-body">
                                <div id="${product.idProduit}-carousel" class="carousel slide mb-3" data-bs-ride="carousel">
                                    <div class="carousel-inner">
                                        ${product.variant.map((variant, index) => `
                                            <div class="carousel-item ${index === 0 ? "active" : ""}" data-bs-interval="3000">
                                                <img src="${variant.cover}" class="d-block w-100 product-img" alt="Image ${index + 1}">
                                            </div>
                                        `).join("")}
                                    </div>
                                    <div class="carousel-indicators">
                                        ${product.variant.map((_, index) => `
                                            <button type="button" data-bs-target="#${product.idProduit}-carousel" data-bs-slide-to="${index}" ${index === 0 ? 'class="active"' : ""}></button>
                                        `).join("")}
                                    </div>
                                </div>
                                <div class="text-center fst-italic">${product.variant[0].price} - ${product.variant[2].price} fcfa</div>
                            </div>
                        </div>
                    </li>
                `;
                // productsContainer.innerHTML += productHTML;

                // Générer l'Offcanvas
                const offcanvasHTML = `
                    <div class="offcanvas offcanvas-end w-100" data-bs-scroll="false" tabindex="-1" id="${product.idProduit}" aria-labelledby="offcanvasLabel-${product.idProduit}">
                        <div class="offcanvas-header">
                            <h5 class="offcanvas-title" id="offcanvasLabel-${product.idProduit}">${product.category}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div class="offcanvas-body">
                            <div class="container">
                                <div class="row g-3">
                                    ${product.variant.map(variant => `
                                        <div class="col-md-4">
                                            <div class="card">
                                                <img src="${variant.cover}" class="card-img-top product-img" alt="${variant.idVariante}">
                                                <div class="card-body">
                                                    <h5 class="card-title">${product.category}</h5>
                                                    <p class="card-text">${product.description}</p>
                                                    <p class="card-text">Prix : ${variant.price} fcfa</p>
                                                    <button class="btn btn-primary add-to-cart" data-name="${product.category}" data-price="${variant.price}">Ajouter au panier</button>
                                                </div>
                                            </div>
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                            <hr>
                            <h2>Panier</h2>
                            <ul class="list-group panier-cart-list"></ul>
                            <p class="mt-3"><strong>Total Articles : </strong><span class="panier-total-produit">0</span></p>
                            <p class="mt-3"><strong>Total : </strong><span class="panier-total-price">0</span> fcfa</p>
                        </div>
                    </div>
                `;
                // offcanvasContainer.innerHTML += offcanvasHTML;
            });

            // Ajouter la gestion du panier
            setupCart();
        })
});

// Fonction pour gérer le panier
function setupCart() {
    let cart = [];
    
    document.body.addEventListener("click", event => {
        if (event.target.classList.contains("add-to-cart")) {
            const name = event.target.dataset.name;
            const price = parseFloat(event.target.dataset.price);

            // Vérifier si le produit existe déjà dans le panier
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            updateCart();
        }
    });

    function updateCart() {
        document.querySelectorAll(".panier-cart-list").forEach(cartList => {
            cartList.innerHTML = cart.map((item, index) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.name} (x${item.quantity}) - ${item.price * item.quantity} fcfa
                    <button class="btn btn-danger btn-sm remove-item" data-index="${index}">X</button>
                </li>
            `).join("");
        });

        const totalArticles = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        document.querySelectorAll(".panier-total-produit").forEach(el => el.textContent = totalArticles);
        document.querySelectorAll(".panier-total-price").forEach(el => el.textContent = totalPrice);

        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", event => {
                const index = event.target.dataset.index;
                cart.splice(index, 1);
                updateCart();
            });
        });
    }
}
