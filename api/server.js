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

app.post("/create_preference", async (req, res) => {
    try {
        const body = {
            items: [
                {
                    title: req.body.title,
                    quantity: Number(req.body.quantity),
                    unit_price: Number(req.body.price),
                    currency_id: "MXN",
                },
            ],
            // Replace with your actual domain in production
            back_urls: {
                success: `${req.protocol}://${req.get('host')}/success`,
                failure: `${req.protocol}://${req.get('host')}/failure`,
                pending: `${req.protocol}://${req.get('host')}/pending`,
            },
            auto_return: "approved",
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating preference" });
    }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
