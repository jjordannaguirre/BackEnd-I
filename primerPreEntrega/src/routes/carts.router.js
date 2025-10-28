import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager('./data/carts.txt');

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({ message: "Carrito creado con éxito.", cart: newCart });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el carrito." });
    }
});

router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    try {
        const cart = await cartManager.getCartById(cartId);
        res.json({ products: cart.products });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
        const updatedCart = await cartManager.addProductToCart(cartId, productId);
        res.json({ message: "Producto agregado/incrementado en el carrito.", cart: updatedCart });
    } catch (error) {
        res.status(404).json({ error: error.message }); 
    }
});

export default router;