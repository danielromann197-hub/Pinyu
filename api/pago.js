const mercadopago = require('mercadopago');

// Configure Mercado Pago with your ACCESS TOKEN
// You should store this in Vercel Environment Variables as MP_ACCESS_TOKEN
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN || 'TEST-8254580252601661-062215-f5e13296235e165345789123456789-123456789' // Replace with your real Access Token
});

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            // Fallback if no items sent (simulated cart)
            // In a real app, you'd validate items against DB prices here
        }

        const preference = {
            items: items.map(item => ({
                title: item.title,
                unit_price: Number(item.unit_price),
                quantity: Number(item.quantity),
            })),
            back_urls: {
                success: "https://tuhomepage.com/success", // Replace with your real URL
                failure: "https://tuhomepage.com/failure",
                pending: "https://tuhomepage.com/pending"
            },
            auto_return: "approved",
        };

        const response = await mercadopago.preferences.create(preference);

        // Respond with the init_point (checkout URL)
        res.status(200).json({
            id: response.body.id,
            init_point: response.body.init_point,
            sandbox_init_point: response.body.sandbox_init_point
        });

    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ error: 'Error creating payment preference' });
    }
};
