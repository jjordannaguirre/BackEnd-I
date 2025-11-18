const socket = io(); 

const realTimeList = document.getElementById('realTimeList');
const createForm = document.getElementById('createProductForm');
const deleteForm = document.getElementById('deleteProductForm');

const renderProducts = (products) => {
    let html = '';
    if (products.length > 0) {
        html += '<ul>';
        products.forEach(p => {
            html += `
                <li>
                    <strong>ID:</strong> ${p.id} <br>
                    <strong>Título:</strong> ${p.title} - $${p.price} <br>
                    Stock: ${p.stock} | Categoría: ${p.category}
                </li>
            `;
        });
        html += '</ul>';
    } else {
        html = '<p>No hay productos disponibles en este momento.</p>';
    }
    realTimeList.innerHTML = html;
};
-
socket.on('productsUpdate', (products) => {
    console.log('Lista de productos actualizada recibida.');
    renderProducts(products);
});

socket.on('productError', (errorMessage) => {
    alert(`Error en la operación: ${errorMessage}`);
});


createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(createForm);
    const productData = Object.fromEntries(formData);
    
    productData.price = parseFloat(productData.price);
    productData.stock = parseInt(productData.stock);

    socket.emit('newProduct', productData);

    createForm.reset();
});


deleteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(deleteForm);
    const { id } = Object.fromEntries(formData);

    if (id) {
        socket.emit('deleteProduct', id);
    }

    deleteForm.reset();
});