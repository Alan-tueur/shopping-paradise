// Sélection des éléments DOM pour le panier
const cartBadge = document.querySelector('.cart-badge');
const cartItems = document.getElementById('cart-items');
const cartEmptyMessage = document.getElementById('cart-empty-message');
const cartContent = document.getElementById('cart-content');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart');

// Initialisation du panier depuis le localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fonction pour mettre à jour le badge du panier
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Fonction pour ajouter un produit au panier
function addToCart(productId) {
    // Vérifier si les produits sont chargés
    if (!window.allProducts) {
        showToast('Erreur: Les produits ne sont pas encore chargés');
        return;
    }

    const product = findProductById(productId);
    if (!product) {
        showToast('Erreur: Produit non trouvé');
        return;
    }

    const existingItem = cart.find(item => item.idProduit === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            idProduit: productId,
            quantity: 1
        });
    }
    
    updateCartBadge();
    updateCartDisplay();
    
    // Afficher une notification
    showToast('Produit ajouté au panier');
}

// Fonction pour mettre à jour l'affichage du panier
function updateCartDisplay() {
    if (!cartItems) return; // Vérifier si l'élément existe

    if (cart.length === 0) {
        cartEmptyMessage.classList.remove('d-none');
        cartContent.classList.add('d-none');
        return;
    }

    cartEmptyMessage.classList.add('d-none');
    cartContent.classList.remove('d-none');

    // Calculer le sous-total
    let subtotal = 0;
    cartItems.innerHTML = cart.map(item => {
        const product = findProductById(item.idProduit);
        if (!product) {
            // Si le produit n'est pas trouvé, le retirer du panier
            cart = cart.filter(cartItem => cartItem.idProduit !== item.idProduit);
            return '';
        }
        
        const itemTotal = product.variant.price * item.quantity;
        subtotal += itemTotal;

        return `
            <li class="list-group-item">
                <div class="d-flex align-items-center">
                    <img src="${product.variant.cover[0]}" alt="${product.description}" class="me-3" style="width: 50px; height: 50px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${product.description}</h6>
                        <small class="text-muted">${product.variant.price.toLocaleString()} fcfa</small>
                        <div class="d-flex align-items-center mt-1">
                            <button class="btn btn-sm btn-outline-secondary me-2" onclick="updateQuantity(${item.idProduit}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary ms-2" onclick="updateQuantity(${item.idProduit}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    // Mettre à jour les totaux
    const shipping = 2000; // Frais de livraison fixes
    cartSubtotal.textContent = `${subtotal.toLocaleString()} fcfa`;
    cartTotal.textContent = `${(subtotal + shipping).toLocaleString()} fcfa`;
}

// Fonction pour mettre à jour la quantité d'un produit
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        cart = cart.filter(item => item.idProduit !== productId);
    } else {
        const item = cart.find(item => item.idProduit === productId);
        if (item) {
            item.quantity = newQuantity;
        }
    }
    
    updateCartBadge();
    updateCartDisplay();
}

// Fonction pour vider le panier
function clearCart() {
    cart = [];
    updateCartBadge();
    updateCartDisplay();
    showToast('Panier vidé');
}

// Fonction pour trouver un produit par son ID
function findProductById(productId) {
    if (!window.allProducts) {
        console.warn('Les produits ne sont pas encore chargés');
        return null;
    }
    return window.allProducts.find(product => product.idProduit === productId);
}

// Fonction pour afficher une notification
function showToast(message) {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.innerHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Shopping Paradise</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(toastContainer);
    const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toast.show();
    
    toastContainer.addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}

// Écouteur d'événement pour le bouton de vidage du panier
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
}

// Initialisation du panier au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    updateCartDisplay();
}); 