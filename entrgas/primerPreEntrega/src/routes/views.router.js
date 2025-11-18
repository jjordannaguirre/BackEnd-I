import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const manager = new ProductManager('./data/products.txt');

router.get('/home', async (req, res) => {
    try {
        const products = await manager.getProducts();
        res.render('home', {
            title: 'Lista de Productos',
            products: products,
            style: 'styles.css' 
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Error al cargar los productos.' });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    res.render('realTimeProducts', {
        title: 'Productos en Tiempo Real (Websockets)',
        style: 'styles.css'
    });
});

export default router;