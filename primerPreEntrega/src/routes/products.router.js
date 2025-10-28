import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js'; 

const router = Router();
const manager = new ProductManager('./data/products.txt'); 

router.get('/', async (req, res) => {
    try {
        const products = await manager.getProducts();
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos." });
    }
});

router.get('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
        const product = await manager.getProductById(productId);
        res.json({ product });
    } catch (error) {
        res.status(404).json({ error: error.message }); 
    }
});

router.post('/', async (req, res) => {
    const newProductData = req.body;
    try {
        const newProduct = await manager.addProduct(newProductData);
        res.status(201).json({ message: "Producto agregado con éxito.", product: newProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:pid', async (req, res) => {
    const productId = req.params.pid;
    const updatedFields = req.body;
    
    if (updatedFields.id) {
        delete updatedFields.id; 
    }
    
    try {
        const updatedProduct = await manager.updateProduct(productId, updatedFields);
        res.json({ message: `Producto con id ${productId} actualizado con éxito.`, product: updatedProduct });
    } catch (error) {
        
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({ error: error.message });
    }
});

router.delete('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
        await manager.deleteProduct(productId);
        res.json({ message: `Producto con id ${productId} eliminado con éxito.` });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;
