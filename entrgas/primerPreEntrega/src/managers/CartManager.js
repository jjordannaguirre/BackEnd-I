import fs from 'fs/promises';
import { randomUUID } from 'crypto';

class CartManager {
    constructor(filePath) {
        this.path = filePath;
    }

    async #readData() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return data.trim() ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }

    async #writeData(data) {
        await fs.writeFile(this.path, JSON.stringify(data, null, 2), 'utf-8');
    }

    async createCart() {
        const carts = await this.#readData();
        const newCart = {
            id: randomUUID(),
            products: []
        };
        
        carts.push(newCart);
        await this.#writeData(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.#readData();
        const cart = carts.find(c => c.id === id);
        if (!cart) {
            throw new Error(`Carrito con id ${id} no encontrado.`);
        }
        return cart;
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.#readData();
        const cartIndex = carts.findIndex(c => c.id === cartId);

        if (cartIndex === -1) {
            throw new Error(`Carrito con id ${cartId} no encontrado.`);
        }

        const cart = carts[cartIndex];
        const productInCartIndex = cart.products.findIndex(item => item.product === productId);

        if (productInCartIndex !== -1) {
            cart.products[productInCartIndex].quantity += 1;
        } else {
            cart.products.push({
                product: productId,
                quantity: 1
            });
        }

        carts[cartIndex] = cart;
        await this.#writeData(carts);
        return cart;
    }
}

export default CartManager;