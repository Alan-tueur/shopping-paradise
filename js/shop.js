// Sélection des éléments DOM
const productsGrid = document.getElementById('products-grid');
const categoryFilters = document.getElementById('category-filters');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const sortSelect = document.getElementById('sort-select');

// Variables globales
let allProducts = [];
let filteredProducts = [];
let selectedCategories = new Set();
let currentMinPrice = 0;
let currentMaxPrice = Infinity;

// Fonction pour charger les produits
async function loadProducts() {
    try {
        const response = await fetch('../datas/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        // Exposer allProducts globalement pour le panier
        window.allProducts = allProducts;
        
        // Initialiser les filtres
        initializeFilters();
        
        // Afficher les produits
        displayProducts();

        // Mettre à jour le panier après le chargement des produits
        if (typeof updateCartDisplay === 'function') {
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        showError('Une erreur est survenue lors du chargement des produits.');
    }
}

// Fonction pour initialiser les filtres
function initializeFilters() {
    // Créer les filtres de catégories
    const categories = [...new Set(allProducts.map(product => product.category))];
    categoryFilters.innerHTML = categories.map(category => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${category}" id="category-${category}">
            <label class="form-check-label" for="category-${category}">
                ${category}
            </label>
        </div>
    `).join('');

    // Ajouter les écouteurs d'événements pour les filtres
    document.querySelectorAll('.form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', handleCategoryFilter);
    });

    // Écouteurs d'événements pour les boutons de filtrage
    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    sortSelect.addEventListener('change', handleSort);
}

// Fonction pour gérer le filtrage par catégorie
function handleCategoryFilter(event) {
    const category = event.target.value;
    if (event.target.checked) {
        selectedCategories.add(category);
    } else {
        selectedCategories.delete(category);
    }
    applyFilters();
}

// Fonction pour appliquer tous les filtres
function applyFilters() {
    // Filtrer par catégorie
    filteredProducts = allProducts.filter(product => {
        if (selectedCategories.size === 0) return true;
        return selectedCategories.has(product.category);
    });

    // Filtrer par prix
    currentMinPrice = minPriceInput.value ? parseInt(minPriceInput.value) : 0;
    currentMaxPrice = maxPriceInput.value ? parseInt(maxPriceInput.value) : Infinity;

    filteredProducts = filteredProducts.filter(product => {
        const price = product.variant.price;
        return price >= currentMinPrice && price <= currentMaxPrice;
    });

    // Appliquer le tri
    handleSort();

    // Afficher les résultats
    displayProducts();
}

// Fonction pour réinitialiser les filtres
function resetFilters() {
    // Réinitialiser les catégories
    selectedCategories.clear();
    document.querySelectorAll('.form-check-input').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Réinitialiser les prix
    minPriceInput.value = '';
    maxPriceInput.value = '';
    currentMinPrice = 0;
    currentMaxPrice = Infinity;

    // Réinitialiser le tri
    sortSelect.value = 'default';

    // Réinitialiser et afficher les produits
    filteredProducts = [...allProducts];
    displayProducts();
}

// Fonction pour gérer le tri
function handleSort() {
    const sortValue = sortSelect.value;
    
    filteredProducts.sort((a, b) => {
        switch (sortValue) {
            case 'price-asc':
                return a.variant.price - b.variant.price;
            case 'price-desc':
                return b.variant.price - a.variant.price;
            case 'name-asc':
                return a.description.localeCompare(b.description);
            case 'name-desc':
                return b.description.localeCompare(a.description);
            default:
                return 0;
        }
    });

    displayProducts();
}

// Fonction pour afficher les produits
function displayProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                <p>Aucun produit ne correspond à vos critères</p>
                <button class="btn btn-outline-primary" onclick="resetFilters()">Réinitialiser les filtres</button>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="col">
            <div class="card h-100">
                <div id="carousel-${product.idProduit}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${product.variant.cover.map((image, index) => `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                <img src="${image}" class="d-block w-100" alt="${product.description}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.description}</h5>
                    <p class="card-text text-muted">${product.category}</p>
                    <p class="card-text fw-bold">${product.variant.price.toLocaleString()} fcfa</p>
                    <button class="btn btn-primary w-100" onclick="addToCart(${product.idProduit})">
                        <i class="bi bi-cart-plus"></i> Ajouter au panier
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Fonction pour afficher une erreur
function showError(message) {
    productsGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="bi bi-exclamation-triangle fs-1 text-danger mb-3 d-block"></i>
            <p>${message}</p>
        </div>
    `;
}

// Charger les produits au chargement de la page
document.addEventListener('DOMContentLoaded', loadProducts); 