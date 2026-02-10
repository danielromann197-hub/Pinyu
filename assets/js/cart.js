/**
 * Pinyu Cart Logic
 * Handles adding to cart, updating counters, and toasts.
 */

// Keys
const CART_KEY = 'pinyuCart';

/**
 * Retrieves the cart from LocalStorage
 * @returns {Array} List of product objects
 */
export function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

/**
 * Saves the cart to LocalStorage
 * @param {Array} cart 
 */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

/**
 * Adds a product to the cart
 * @param {Object} product { title, price, image, quantity }
 */
export function addToCart(product) {
    const cart = getCart();
    
    // Check if item already exists (by title for now, ideally by ID)
    const existingItemIndex = cart.findIndex(item => item.title === product.title);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += product.quantity;
    } else {
        cart.push(product);
    }

    saveCart(cart);
    showToast(product);
}

/**
 * Removes a product from the cart
 * @param {number} index Index of the item in the array
 */
export function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    // If we are on the cart page, we might want to re-render
    if (window.location.pathname.includes('carrito')) {
        renderCartPage();
    }
}

/**
 * Updates the quantity of a product in the cart
 * @param {number} index 
 * @param {number} newQuantity 
 */
export function updateQuantity(index, newQuantity) {
    const cart = getCart();
    if (newQuantity < 1) return;
    cart[index].quantity = newQuantity;
    saveCart(cart);
    if (window.location.pathname.includes('carrito')) {
        renderCartPage();
    }
}

/**
 * Updates all cart icon counters in the DOM
 */
export function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = `(${count})`;
    });
}

/**
 * Shows a toast notification
 * @param {Object} product 
 */
function showToast(product) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    toast.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <div class="toast-content">
            <h4>¡Agregado al carrito!</h4>
            <p>${product.title}</p>
        </div>
    `;

    container.appendChild(toast);

    // Trigger reflow for animation
    void toast.offsetWidth; 
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Renders the Cart Page (carrito.html)
 */
export function renderCartPage() {
    const cartContent = document.getElementById('cart-content-dynamic');
    if (!cartContent) return;

    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCountParams = cart.length; // items distinct count or total quantity? usually total quantity for badge, distinct for list

    // Update Totals
    const totalEls = document.querySelectorAll('.cart-total-value');
    totalEls.forEach(el => el.textContent = `$${total.toFixed(2)}`);

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🍃</div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Corre a llenarlo de cosas bonitas!</p>
                <a href="/tienda" class="btn btn-primary" style="margin-top: 2rem;">Ir a la Tienda</a>
            </div>
        `;
        // Hide checkout section if empty
        const checkoutSection = document.getElementById('checkout-section');
        if(checkoutSection) checkoutSection.style.display = 'none';
        return;
    }

    // Show checkout section
    const checkoutSection = document.getElementById('checkout-section');
    if(checkoutSection) checkoutSection.style.display = 'block';

    let html = '';
    cart.forEach((item, index) => {
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.title}</h3>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="qty-btn minus" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                    <button class="remove-btn" data-index="${index}">🗑️</button>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `;
    });

    cartContent.innerHTML = html;

    // Attach Event Listeners
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const currentQty = cart[index].quantity;
            if (currentQty > 1) {
                updateQuantity(index, currentQty - 1);
            }
        });
    });

    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            updateQuantity(index, cart[index].quantity + 1);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if(confirm('¿Seguro que quieres eliminar este producto?')) {
                removeFromCart(index);
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (window.location.pathname.includes('carrito')) {
        renderCartPage();
    }
});
