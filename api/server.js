const express = require("express");
const cors = require("cors");
const path = require("path");
const { MercadoPagoConfig, Preference } = require("mercadopago");
require("dotenv").config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../'))); // Serve static files from root

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

// Page Routes (Clean URLs)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.get('/tienda', (req, res) => res.sendFile(path.join(__dirname, '../tienda.html')));
app.get('/sobre', (req, res) => res.sendFile(path.join(__dirname, '../sobre.html')));
app.get('/contacto', (req, res) => res.sendFile(path.join(__dirname, '../contacto.html')));
app.get('/producto', (req, res) => res.sendFile(path.join(__dirname, '../producto.html')));
app.get('/carrito', (req, res) => res.sendFile(path.join(__dirname, '../carrito.html')));
app.get('/faq', (req, res) => res.sendFile(path.join(__dirname, '../faq.html')));

app.get('/success', (req, res) => {
    res.send(`
        <html>
            <head><link rel="stylesheet" href="/styles.css"></head>
            <body style="text-align:center; padding:50px; font-family:'Quicksand', sans-serif;">
                <h1 style="color:#FF69B4;">¡Pago Exitoso! 💖</h1>
                <p>Gracias por tu compra. Te enviaremos un correo con los detalles.</p>
                <a href="/" class="btn btn-primary">Volver al inicio</a>
            </body>
        </html>
    `);
});

app.get('/failure', (req, res) => {
    res.send(`
        <html>
            <head><link rel="stylesheet" href="/styles.css"></head>
            <body style="text-align:center; padding:50px; font-family:'Quicksand', sans-serif;">
                <h1 style="color:red;">El pago falló 😢</h1>
                <p>Lo sentimos, hubo un problema con tu pago.</p>
                <a href="/carrito" class="btn btn-primary">Intentar de nuevo</a>
            </body>
        </html>
    `);
});

app.get('/pending', (req, res) => {
    res.send(`
        <html>
            <head><link rel="stylesheet" href="/styles.css"></head>
            <body style="text-align:center; padding:50px; font-family:'Quicksand', sans-serif;">
                <h1 style="color:#FFC3D1;">Pago Pendiente ⏳</h1>
                <p>Tu pago se está procesando.</p>
                <a href="/" class="btn btn-primary">Volver al inicio</a>
            </body>
        </html>
    `);
});

app.post("/create_preference", async (req, res) => {
    try {
        const dotenvResult = require("dotenv").config({ path: path.join(__dirname, '../.env') });
        if (dotenvResult.error) {
            console.warn("Dotenv error:", dotenvResult.error);
        }

        const DOMAIN = process.env.DOMAIN || 'https://pinyu.art';
        console.log("Using DOMAIN:", DOMAIN);

        if (!DOMAIN || DOMAIN.includes("localhost") && !DOMAIN.startsWith("http")) {
            console.warn("Warning: DOMAIN might be invalid for production:", DOMAIN);
        }

        const body = {
            items: [
                {
                    title: req.body.title,
                    quantity: Number(req.body.quantity),
                    unit_price: Number(req.body.price),
                    currency_id: "MXN",
                },
            ],
            back_urls: {
                success: `${DOMAIN}/success`,
                failure: `${DOMAIN}/failure`,
                pending: `${DOMAIN}/pending`,
            },
            auto_return: "approved",
        };

        const preference = new Preference(client);
        console.log("Creating preference with body:", JSON.stringify(body));
        const result = await preference.create({ body });
        console.log("Preference created successfully:", result.id);
        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error("Error creating preference:", error);
        res.status(500).json({
            error: "Error creating preference",
            details: error.message,
            stack: error.stack
        });
    }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
