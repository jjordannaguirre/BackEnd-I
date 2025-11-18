import express from 'express';
import { createServer } from 'http'; // Para crear el servidor HTTP base
import { Server } from 'socket.io'; // Para el servidor de WebSockets
import handlebars from 'express-handlebars';
import path from 'path';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';

// --- CONFIGURACIÓN INICIAL DEL SERVIDOR ---
const app = express();
const httpServer = createServer(app); // Creamos el servidor HTTP
const io = new Server(httpServer); // Conectamos Socket.io al servidor HTTP
const PORT = 8080;
const manager = new ProductManager('./data/products.txt'); // Instancia del Manager

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const __dirname = path.resolve(); 

// --- CONFIGURACIÓN DE HANDLEBARS ---
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'handlebars');

// --- CARPETAS ESTÁTICAS (CSS/JS del cliente) ---
app.use(express.static(path.join(__dirname, 'src/public')));

// --- RUTAS DE LA APLICACIÓN ---
app.use('/', viewsRouter); 
app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter);     

// --- WEBSOCKETS (SOCKET.IO) ---
io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado al socket.');

    const products = await manager.getProducts();
    socket.emit('productsUpdate', products);

    socket.on('newProduct', async (data) => {
        try {
            data.status = data.status === 'true' || data.status === true; 
            await manager.addProduct(data);
            
            const updatedProducts = await manager.getProducts();
            io.emit('productsUpdate', updatedProducts);
        } catch (error) {
            console.error('Error al agregar producto por socket:', error.message);
            socket.emit('productError', error.message); 
        }
    });

    socket.on('deleteProduct', async (id) => {
        try {
            await manager.deleteProduct(id);
            
            const updatedProducts = await manager.getProducts();
            io.emit('productsUpdate', updatedProducts);
        } catch (error) {
             console.error('Error al eliminar producto por socket:', error.message);
             socket.emit('productError', error.message);
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});