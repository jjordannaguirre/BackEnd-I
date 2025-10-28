import fs from 'fs/promises';
import { randomUUID } from 'crypto';

class ProductManager {
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

    #validateProduct(product) {
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of requiredFields) {
            if (!product[field] || (typeof product[field] === 'string' && product[field].trim() === '')) {
                throw new Error(`El campo '${field}' es obligatorio.`);
            }
        }
        if (typeof product.price !== 'number' || product.price <= 0) throw new Error('Precio debe ser un número positivo.');
        if (typeof product.stock !== 'number' || product.stock < 0) throw new Error('Stock debe ser un número positivo.');
    }

    async getProducts() {
        return await this.#readData();
    }

    async getProductById(id) {
        const products = await this.#readData();
        const product = products.find(p => p.id === id);
        if (!product) {
            throw new Error(`Producto con id ${id} no encontrado.`);
        }
        return product;
    }

    async addProduct(productData) {
        this.#validateProduct(productData);

        const products = await this.#readData();
        
        if (products.some(p => p.code === productData.code)) {
            throw new Error(`El código '${productData.code}' ya existe.`);
        }

        const newProduct = {
            id: randomUUID(), 
            status: true, 
            thumbnails: [], 
            ...productData
        };

        products.push(newProduct);
        await this.#writeData(products);
        return newProduct;
    }

    async updateProduct(id, updateFields) {
        const products = await this.#readData();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            throw new Error(`Producto con id ${id} no encontrado para actualizar.`);
        }

        const product = products[index];
        const updatedProduct = { ...product };

        for (const key in updateFields) {
            if (key !== 'id' && product.hasOwnProperty(key)) {
                updatedProduct[key] = updateFields[key];
            }
        }

        if (updateFields.code && updateFields.code !== product.code) {
             if (products.some((p, i) => p.code === updateFields.code && i !== index)) {
                throw new Error(`El código '${updateFields.code}' ya existe en otro producto.`);
            }
        }

        this.#validateProduct(updatedProduct);
        
        products[index] = updatedProduct;
        await this.#writeData(products);
        return updatedProduct;
    }

    async deleteProduct(id) {
        const products = await this.#readData();
        const initialLength = products.length;
        const newProducts = products.filter(p => p.id !== id);

        if (newProducts.length === initialLength) {
            throw new Error(`Producto con id ${id} no encontrado para eliminar.`);
        }

        await this.#writeData(newProducts);
    }
}

export default ProductManager;