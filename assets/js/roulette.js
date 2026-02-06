/* Roulette Logic */

// State - using localStorage for persistence across pages
let cartTotal = parseFloat(localStorage.getItem('cartTotal')) || 0;
let cartItems = parseInt(localStorage.getItem('cartItems')) || 0;
const MINIMUM_TO_SPIN = 0; // Temporarily 0 for testing
let hasSpun = localStorage.getItem('hasSpun') === 'true';

// DOM Elements
const fab = document.createElement('div');
fab.id = 'roulette-fab';
fab.innerHTML = '🎡';
document.body.appendChild(fab);

const modalOverlay = document.createElement('div');
modalOverlay.className = 'roulette-modal-overlay';
modalOverlay.innerHTML = `
    <div class="roulette-modal">
        <button class="close-modal">&times;</button>
        <h2 style="color: var(--roulette-dark); margin-bottom: 0.5rem;">¡Ruleta Kawaii! 🌸</h2>
        <p style="color: #777; margin-bottom: 2rem;">¡Gracias por tu compra mayor a $500!</p>
        
        <div class="wheel-container">
            <div class="wheel-pointer"></div>
            <div class="wheel" id="wheel">
                <!-- Segments text overlay -->
                <div class="wheel-text">
                    <div class="segment-label segment-1">15% OFF 🏷️</div>
                    <div class="segment-label segment-2">ENVÍO 🚚</div>
                    <div class="segment-label segment-3">SORPRESA 🎁</div>
                    <div class="segment-label segment-4">2x1 🐱</div>
                    <div class="segment-label segment-5">STICKERS ✨</div>
                </div>
            </div>
            <div class="wheel-center">💖</div>
        </div>

        <button class="spin-btn" id="spin-btn">¡GIRA Y GANA!</button>
        <div id="prize-result"></div>
    </div>
`;
document.body.appendChild(modalOverlay);

// Elements selection
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const closeBtn = document.querySelector('.close-modal');
const prizeResult = document.getElementById('prize-result');
const cartIcons = document.querySelectorAll('.cart-icon');

// 1. Cart Simulation & Persistence Logic
function updateCartUI() {
    cartIcons.forEach(icon => {
        const span = icon.querySelector('span');
        if (span) span.innerText = `(${cartItems}) $${cartTotal.toFixed(2)}`;

        // Make cart icon clickable to go to cart page
        icon.onclick = () => window.location.href = 'carrito.html';
        icon.style.cursor = 'pointer';
    });

    // Save state
    localStorage.setItem('cartTotal', cartTotal);
    localStorage.setItem('cartItems', cartItems);

    checkRouletteCondition();
}

function addToCart(price) {
    cartTotal += price;
    cartItems++;
    updateCartUI();

    // Optional: visual feedback
    if (event && event.target) {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "¡Agregado! 💖";
        setTimeout(() => {
            btn.innerText = originalText;
        }, 1000);
    }
}

function checkRouletteCondition() {
    if (cartTotal >= MINIMUM_TO_SPIN && !hasSpun) {
        fab.style.display = 'flex';
    } else {
        fab.style.display = 'none';
        modalOverlay.classList.remove('active');
    }
}

// 2. Roulette Logic
fab.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

// Close on outside click
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

spinBtn.addEventListener('click', () => {
    if (hasSpun) return;

    spinBtn.disabled = true;
    spinBtn.innerText = "Girando...";

    // PRECISION LOGIC
    // 5 Segments, 72deg each.
    // Segment 1 (0-72deg): 15% OFF
    // Segment 2 (72-144deg): ENVIO
    // Segment 3 (144-216deg): SORPRESA
    // Segment 4 (216-288deg): 2x1
    // Segment 5 (288-360deg): STICKERS

    // We want to land in the center of a segment to be safe.
    // Center angles: 36, 108, 180, 252, 324.
    const segmentCenters = [36, 108, 180, 252, 324];

    // Pick a random winner
    const winningIndex = Math.floor(Math.random() * 5);
    // 0 = Seg 1, 1 = Seg 2, etc.

    const targetAngle = segmentCenters[winningIndex]; // The angle ON THE WHEEL that should be at the TOP (0deg).

    // Rotation Math:
    // If we want angle "A" to be at the top (0deg visual), we need to rotate the div such that:
    // (FinalRotation % 360) = (360 - A) % 360;
    // Example: To show 36deg at top, we rotate -36deg (or 324deg).

    const visualRotationNeeded = (360 - targetAngle) % 360;

    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 360;

    // FIX: User reported "Stickers" (Index 4) visible when "15%" (Index 0) won.
    // This implies a misalignment. 
    // Applying -72deg offset to shift visual back to Index 0 from Index 4.
    const alignmentOffset = -72;

    const finalRotation = extraSpins + visualRotationNeeded + alignmentOffset;

    wheel.style.transform = `rotate(${finalRotation}deg)`;

    setTimeout(() => {
        let prize = "";
        // Determine prize text based on winningIndex directly to avoid math errors
        switch (winningIndex) {
            case 0: prize = "15% DE DESCUENTO 🏷️"; break;
            case 1: prize = "ENVÍO GRATIS 🚚"; break;
            case 2: prize = "PIN SORPRESA 🎁"; break;
            case 3: prize = "2x1 EN GATITOS 🐱"; break;
            case 4: prize = "PACK DE STICKERS ✨"; break;
        }

        showResult(prize);
        hasSpun = true;
        localStorage.setItem('hasSpun', 'true');

        // Confetti!
        for (let i = 0; i < 50; i++) {
            createConfetti();
        }
    }, 4000);
});

function showResult(prizeText) {
    prizeResult.innerText = `¡Ganaste: ${prizeText}!`;
    prizeResult.classList.add('show');
    spinBtn.innerText = "¡Premio Reclamado!";
    spinBtn.style.background = "var(--roulette-pink)";

    // Hide FAB after winning
    fab.style.display = 'none';
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 75%)`;
    confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4000);
}

// Global exposure
window.addToCart = addToCart;

// Initialize check on load
updateCartUI();
