// Gestion du panier et des produits
document.addEventListener("DOMContentLoaded", function () {
    // Sélection des éléments DOM
    const productContainer = document.getElementById("products");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartBadges = document.querySelectorAll(".cart-badge");
    const cartEmptyMessage = document.getElementById("cart-empty-message");
    const cartContent = document.getElementById("cart-content");
    const clearCartBtn = document.getElementById("clear-cart");
    const offcanvasContainer = document.body;

    // Initialisation du panier depuis localStorage
    let cart = JSON.parse(localStorage.getItem("shopping-paradise-cart")) || [];
    
    // Variables pour les catégories
    let categories = [];
    let productsByCategory = {};

    // Chargement des produits depuis le fichier JSON
    fetch("datas/products.json")
        .then(response => response.json())
        .then(products => {
            // Extraire toutes les catégories uniques
            products.forEach(product => {
                if (!categories.includes(product.category)) {
                    categories.push(product.category);
                    productsByCategory[product.category] = [];
                }
                productsByCategory[product.category].push(product);
            });

            // Créer un conteneur pour chaque catégorie
            categories.forEach(category => {
                // Créer un titre de section pour la catégorie
                const categoryTitle = document.createElement("div");
                categoryTitle.classList.add("col-12", "mt-4", "mb-3");
                categoryTitle.innerHTML = `<h3 class="category-title">${category}</h3>
                                          <hr class="category-divider">`;
                productContainer.appendChild(categoryTitle);

                // Afficher les produits de cette catégorie
                productsByCategory[category].forEach(product => {
                    // Création de l'élément produit pour la liste principale
                    const productElement = document.createElement("div");
                    productElement.classList.add("col", "mb-4");
                    productElement.innerHTML = `
                        <div class="card shadow-sm h-100" type="button" data-bs-toggle="offcanvas" data-bs-target="#${product.idProduit}">
                            <div class="card-body d-flex flex-column">
                                <div id="${product.idProduit}-carousel" class="carousel slide mb-3" data-bs-ride="carousel">
                                    <div class="carousel-inner">
                                        ${product.variant.map((variant, index) => `
                                            <div class="carousel-item ${index === 0 ? "active" : ""}" data-bs-interval="3000">
                                                <img src="${variant.cover}" class="d-block w-100 product-img img-fluid" alt="Image ${index + 1}" loading="lazy" style="height: 300px; object-fit: cover;">
                                            </div>
                                        `).join("")}
                                    </div>
                                    <div class="carousel-indicators">
                                        ${product.variant.map((_, index) => `
                                            <button type="button" data-bs-target="#${product.idProduit}-carousel" data-bs-slide-to="${index}" ${index === 0 ? 'class="active"' : ""}></button>
                                        `).join("")}
                                    </div>
                                </div>
                                <h5 class="card-title text-center">${product.category}</h5>
                                <p class="card-text small text-truncate">${product.description}</p>
                                <div class="text-center fst-italic mt-auto">${product.variant[0].price.toLocaleString()} - ${product.variant[2].price.toLocaleString()} fcfa</div>
                            </div>
                        </div>`;
                    productContainer.appendChild(productElement);

                    // Création de l'offcanvas pour les détails du produit
                    const productElementoff = document.createElement("div");
                    productElementoff.classList.add("product-offcanvas");
                    productElementoff.innerHTML = `
                        <div class="offcanvas offcanvas-end w-100" data-bs-scroll="false" tabindex="-1" id="${product.idProduit}" aria-labelledby="offcanvasLabel-${product.idProduit}">
                            <div class="offcanvas-header">
                                <h5 class="offcanvas-title" id="offcanvasLabel-${product.idProduit}">${product.category}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                            </div>
                            <div class="offcanvas-body">
                                <div class="container">
                                    <div class="row g-3 justify-content-center">
                                        ${product.variant.map(variant => `
                                            <div class="col-md-4 d-flex justify-content-center">
                                                <div class="card h-100">
                                                    <img src="${variant.cover}" class="card-img-top product-img img-fluid" alt="${variant.idVariante}" loading="lazy" style="height: 250px; object-fit: cover;">
                                                    <div class="card-body d-flex flex-column">
                                                        <h5 class="card-title">${product.category}</h5>
                                                        <p class="card-text">${product.description}</p>
                                                        <p class="card-text">Prix : ${variant.price.toLocaleString()} fcfa</p>
                                                        <button class="btn btn-primary add-to-cart mt-auto" 
                                                                data-id="${variant.idVariante}" 
                                                                data-name="${product.category}" 
                                                                data-price="${variant.price}"
                                                                data-image="${variant.cover}">
                                                            Ajouter au panier
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join("")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    offcanvasContainer.appendChild(productElementoff);
                });
            });

            // Initialiser les événements du panier après chargement des produits
            setupCartEvents();
            // Mettre à jour l'affichage du panier
            updateCartDisplay();
        })
        .catch(error => {
            console.error("Erreur lors du chargement des produits:", error);
            productContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        Impossible de charger les produits. Veuillez réessayer plus tard.
                    </div>
                </div>
            `;
        });

    // Configuration des événements du panier
    function setupCartEvents() {
        // Ajouter des produits au panier
        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", function(e) {
                e.stopPropagation(); // Empêcher la propagation pour éviter la fermeture de l'offcanvas
                
                const id = this.getAttribute("data-id");
                const name = this.getAttribute("data-name");
                const price = parseFloat(this.getAttribute("data-price"));
                const image = this.getAttribute("data-image");
                
                addToCart(id, name, price, image);
                
                // Afficher un message de confirmation
                const toast = document.createElement("div");
                toast.classList.add("toast", "position-fixed", "bottom-0", "end-0", "m-3");
                toast.setAttribute("role", "alert");
                toast.setAttribute("aria-live", "assertive");
                toast.setAttribute("aria-atomic", "true");
                toast.innerHTML = `
                    <div class="toast-header">
                        <strong class="me-auto">Produit ajouté</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        ${name} a été ajouté à votre panier.
                    </div>
                `;
                document.body.appendChild(toast);
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
                
                // Supprimer le toast après disparition
                toast.addEventListener('hidden.bs.toast', function () {
                    document.body.removeChild(toast);
                });
            });
        });
        
        // Vider le panier
        if (clearCartBtn) {
            clearCartBtn.addEventListener("click", function() {
                cart = [];
                saveCart();
                updateCartDisplay();
            });
        }
    }

    // Fonction pour ajouter un produit au panier
    function addToCart(id, name, price, image) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id,
                name,
                price,
                image,
                quantity: 1
            });
        }
        
        saveCart();
        updateCartDisplay();
    }
    
    // Fonction pour sauvegarder le panier dans localStorage
    function saveCart() {
        localStorage.setItem("shopping-paradise-cart", JSON.stringify(cart));
    }

    // Fonction pour mettre à jour l'affichage du panier
    function updateCartDisplay() {
        // Afficher/masquer le message de panier vide
        if (cart.length === 0) {
            if (cartEmptyMessage) cartEmptyMessage.classList.remove("d-none");
            if (cartContent) cartContent.classList.add("d-none");
        } else {
            if (cartEmptyMessage) cartEmptyMessage.classList.add("d-none");
            if (cartContent) cartContent.classList.remove("d-none");
        }
        
        // Mettre à jour le compteur du panier
        let totalItems = 0;
        cart.forEach(item => {
            totalItems += item.quantity;
        });
        
        cartBadges.forEach(badge => {
            badge.textContent = totalItems;
        });
        
        // Mettre à jour la liste des articles
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = "";
            
            let subtotal = 0;
            
            cart.forEach((item, index) => {
                subtotal += item.price * item.quantity;
                
                const cartItem = document.createElement("li");
                cartItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
                cartItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" class="img-thumbnail me-2" style="width: 50px; height: 50px; object-fit: cover;" alt="${item.name}">
                        <div>
                            <div>${item.name}</div>
                            <div class="text-muted small">${item.price.toLocaleString()} fcfa × ${item.quantity}</div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="fw-bold me-2">${(item.price * item.quantity).toLocaleString()} fcfa</span>
                        <button class="btn btn-sm btn-outline-danger remove-from-cart" data-index="${index}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
            
            // Ajouter les événements pour supprimer des articles
            document.querySelectorAll(".remove-from-cart").forEach(button => {
                button.addEventListener("click", function() {
                    const index = this.getAttribute("data-index");
                    cart.splice(index, 1);
                    saveCart();
                    updateCartDisplay();
                });
            });
            
            // Mettre à jour les totaux
            if (cartSubtotal) cartSubtotal.textContent = subtotal.toLocaleString() + " fcfa";
            if (cartTotal) cartTotal.textContent = (subtotal + 2000).toLocaleString() + " fcfa";
        }
    }
});

// Gestion du panier persistant avec localStorage
document.addEventListener("DOMContentLoaded", () => {
    const cartList = document.getElementById("cart-list");
    const totalPrice = document.getElementById("total-price");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Fonction pour mettre à jour le panier persistant
    function updateCart() {
        cartList.innerHTML = "";
        let total = 0;
        cart.forEach((item, index) => {
            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.innerHTML = `${item.name} - ${item.price}<i>fcfa</i> <button class='btn btn-danger btn-sm float-end remove-from-cart' data-index='${index}'>X</button>`;
            cartList.appendChild(li);
            total += item.price;
        });
        totalPrice.textContent = total;
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Gestion des événements pour ajouter au panier
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const name = button.getAttribute("data-name");
            const price = parseFloat(button.getAttribute("data-price"));
            cart.push({ name, price });
            updateCart();
        });
    });

    // Gestion des événements pour supprimer du panier
    cartList.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-from-cart")) {
            const index = event.target.getAttribute("data-index");
            cart.splice(index, 1);
            updateCart();
        }
    });

    // Initialisation du panier
    updateCart();
});
