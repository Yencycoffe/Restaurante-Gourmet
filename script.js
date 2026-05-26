// --- 1. DATA & INITIAL STATE ---
const DEFAULT_DISHES = [
    { id: 1, name: "Empanadas de Yuca", description: "3 tradicionales empanadas de masa de yuca, crujientes y rellenas de carne.", price: 12500, category: "Entradas", image: "https://images.pexels.com/photos/37025262/pexels-photo-37025262.jpeg" },
    { id: 2, name: "Arepa de Choclo", description: "Maíz tierno con generosa capa de queso campesino.", price: 9500, category: "Entradas", image: "https://media.istockphoto.com/id/1837269165/photo/corn-cachapas-with-white-cheese-typical-venezuelan-dish.jpg?s=2048x2048&w=is&k=20&c=TCDogiZYq-fKciHWZn0z2JjMwUOVx5teDQqhqGEeKYk=" },
    { id: 3, name: "Dedos de Yuca", description: "6 palitos de yuca crocantes rellenos de queso hilado con salsa de la casa.", price: 12000, category: "Entradas", image: "https://images.pexels.com/photos/29450676/pexels-photo-29450676.jpeg" },
    { id: 4, name: "Carne Asada Especial", description: "Corte de res a la parrilla, arroz, papa salada y ensalada fresca.", price: 42000, category: "Platos Fuertes", image: "https://images.pexels.com/photos/36850059/pexels-photo-36850059.jpeg" },
    { id: 5, name: "Ajiaco Santafereño", description: "Sopa tradicional con pollo, tres tipos de papas y guascas.", price: 32000, category: "Platos Fuertes", image: "https://images.pexels.com/photos/37024898/pexels-photo-37024898.jpeg?auto=compress&cs=tinysrgb&w=1260" },
    { id: 6, name: "Pasta a la Bolognesa", description: "Pasta artesanal con salsa de carne y parmesano.", price: 29000, category: "Platos Fuertes", image: "https://images.pexels.com/photos/12667658/pexels-photo-12667658.jpeg?auto=compress&cs=tinysrgb&w=1260" },
    { id: 7, name: "Limonada de Coco", description: "Bebida insignia refrescante y cremosa.", price: 12500, category: "Bebidas", image: "https://images.pexels.com/photos/32512485/pexels-photo-32512485.jpeg?auto=compress&cs=tinysrgb&w=1260" },
    { id: 8, name: "Sodas", description: "Refrescantes sodas saborizadas de frutos rojos, maracuyá y lulo.", price: 10500, category: "Bebidas", image: "https://images.pexels.com/photos/28525184/pexels-photo-28525184.jpeg" },
    { id: 9, name: "Brownie con Helado", description: "Brownie melcochudo con helado de vainilla.", price: 15000, category: "Postres", image: "https://images.pexels.com/photos/33674421/pexels-photo-33674421.jpeg?auto=compress&cs=tinysrgb&w=1260" }
];

// Force update to v25 to clear cache
if (!localStorage.getItem('rest_v25')) {
    localStorage.removeItem('rest_dishes');
    localStorage.setItem('rest_v25', 'true');
}

let dishes = JSON.parse(localStorage.getItem('rest_dishes')) || DEFAULT_DISHES;
let orders = JSON.parse(localStorage.getItem('rest_orders')) || [];
let reservations = JSON.parse(localStorage.getItem('rest_reservations')) || [];
let customers = JSON.parse(localStorage.getItem('rest_customers')) || [];
let cart = JSON.parse(localStorage.getItem('rest_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('rest_user')) || null;
let activeCategory = 'all';
let searchQuery = '';
// Reservation email destination (update to your inbox)
const RESERVATION_EMAIL = 'reservas@tudominio.com';
// Delivery state
let deliveryMode = 'pickup'; // 'pickup' or 'delivery'
let deliveryFee = 0;
const DELIVERY_FLAT = 7000;

// --- 2. AUTH MODULE ---
const USERS = {
    'admin': { pass: 'admin123', role: 'admin', name: 'Administrador' },
    'mesero': { pass: 'mesero123', role: 'waiter', name: 'Mesero Juan' },
    'cliente': { pass: 'cliente123', role: 'client', name: 'Cliente' }
};

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    if (USERS[user] && USERS[user].pass === pass) {
        currentUser = { ...USERS[user], username: user };
        localStorage.setItem('rest_user', JSON.stringify(currentUser));
        document.getElementById('login-modal').classList.remove('active');
        showToast(`Bienvenido, ${currentUser.name}`);
        
        initApp();
        
        // Redirect based on role
        if (currentUser.role === 'admin') switchView('view-admin-menu');
        else if (currentUser.role === 'waiter') switchView('view-waiter');
    } else {
        showToast("Credenciales incorrectas", "danger");
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('rest_user');
    window.location.reload();
}

// --- 3. VIEW SWITCHER ---
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    document.querySelectorAll('.main-nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.view === viewId);
    });

    // Refresh view specific content
    if (viewId === 'view-menu') renderClientMenu();
    if (viewId === 'view-waiter') renderWaiterBoard();
    if (viewId === 'view-admin-menu') renderAdminMenuTable();
    if (viewId === 'view-customers') renderCustomersTable();
    if (viewId === 'view-reservations') renderReservations();
    if (viewId === 'view-reports') renderReports();
}

function updateNavigation() {
    const nav = document.getElementById('main-nav');
    const role = currentUser ? currentUser.role : 'client';
    let html = '<ul>';
    
    html += `<li><a data-view="view-menu" class="active">Menú</a></li>`;
    html += `<li><a data-view="view-reservations">Reservas</a></li>`;
    
    if (role === 'waiter' || role === 'admin') {
        html += `<li><a data-view="view-waiter">Mesero</a></li>`;
    }
    
    if (role === 'admin') {
        html += `<li><a data-view="view-admin-menu">Gestión Menú</a></li>`;
        html += `<li><a data-view="view-customers">Clientes</a></li>`;
        html += `<li><a data-view="view-reports">Reportes</a></li>`;
    }
    
    html += '</ul>';
    nav.innerHTML = html;
    
    const loginTrigger = document.getElementById('login-trigger');
    const userLogged = document.getElementById('user-logged');
    
    if (currentUser) {
        loginTrigger.classList.add('hidden');
        userLogged.classList.remove('hidden');
        document.getElementById('username-text').textContent = currentUser.name;
    } else {
        loginTrigger.classList.remove('hidden');
        userLogged.classList.add('hidden');
    }
    
    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            switchView(e.target.dataset.view);
        }
    });
}

// --- 4. MENU MODULE (CLIENT) ---
function renderClientMenu() {
    const grid = document.getElementById('menu-grid');
    let filtered = dishes;
    if (activeCategory !== 'all') filtered = filtered.filter(d => d.category === activeCategory);
    if (searchQuery) filtered = filtered.filter(d => d.name.toLowerCase().includes(searchQuery));

    grid.innerHTML = filtered.map(dish => `
        <div class="dish-card">
            <div class="dish-img-container">
                <img src="${dish.image}" alt="${dish.name}" loading="lazy">
                <span class="dish-category">${dish.category}</span>
            </div>
            <div class="dish-info">
                <h3>${dish.name}</h3>
                <p>${dish.description}</p>
                <div class="dish-footer">
                    <span class="dish-price">$${dish.price.toLocaleString('es-CO')}</span>
                    <button class="btn-add" onclick="addToCart(${dish.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    // Apply image entrance animations after rendering
    requestAnimationFrame(() => animateMenuImages());
}

// Animate dish images when they enter the viewport with a slight stagger
function animateMenuImages() {
    const imgs = Array.from(document.querySelectorAll('.dish-img-container img'));
    if (!imgs.length) return;

    // Add base class for animation and set stagger delays
    imgs.forEach((img, i) => {
        img.classList.add('img-animate');
        img.style.setProperty('--delay', `${i * 60}ms`);
    });

    // IntersectionObserver to add 'in-view' when visible
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    imgs.forEach(img => observer.observe(img));
}

// --- 5. ADMIN CRUD MODULE ---
function renderAdminMenuTable() {
    const tbody = document.getElementById('admin-menu-table');
    tbody.innerHTML = dishes.map(dish => `
        <tr>
            <td><img src="${dish.image}" class="td-img"></td>
            <td>${dish.name}</td>
            <td>${dish.category}</td>
            <td>$${dish.price.toLocaleString('es-CO')}</td>
            <td>
                <button class="btn-icon" onclick="editDish(${dish.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteDish(${dish.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openDishModal(dish = null) {
    const isEdit = !!dish;
    openModal(isEdit ? "Editar Platillo" : "Nuevo Platillo", `
        <form id="dish-form">
            <input type="hidden" id="edit-id" value="${dish ? dish.id : ''}">
            <div class="form-group"><label>Nombre</label><input type="text" id="dish-name" required value="${dish ? dish.name : ''}"></div>
            <div class="form-group"><label>Categoría</label>
                <select id="dish-category">
                    <option ${dish?.category === 'Entradas' ? 'selected' : ''}>Entradas</option>
                    <option ${dish?.category === 'Platos Fuertes' ? 'selected' : ''}>Platos Fuertes</option>
                    <option ${dish?.category === 'Bebidas' ? 'selected' : ''}>Bebidas</option>
                    <option ${dish?.category === 'Postres' ? 'selected' : ''}>Postres</option>
                </select>
            </div>
            <div class="form-group"><label>Precio</label><input type="number" id="dish-price" required value="${dish ? dish.price : ''}"></div>
            <div class="form-group"><label>Imagen URL</label><input type="text" id="dish-image" required value="${dish ? dish.image : ''}"></div>
            <div class="form-group"><label>Descripción</label><textarea id="dish-desc">${dish ? dish.description : ''}</textarea></div>
            <button type="submit" class="btn-primary btn-block">Guardar</button>
        </form>
    `);

    document.getElementById('dish-form').onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const newDish = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('dish-name').value,
            category: document.getElementById('dish-category').value,
            price: parseFloat(document.getElementById('dish-price').value),
            image: document.getElementById('dish-image').value,
            description: document.getElementById('dish-desc').value
        };

        if (id) dishes = dishes.map(d => d.id === parseInt(id) ? newDish : d);
        else dishes.push(newDish);

        saveData('rest_dishes', dishes);
        renderAdminMenuTable();
        closeModal();
        showToast("Menú actualizado");
    };
}

window.deleteDish = (id) => {
    if (confirm("¿Eliminar este platillo?")) {
        dishes = dishes.filter(d => d.id !== id);
        saveData('rest_dishes', dishes);
        renderAdminMenuTable();
    }
};

window.editDish = (id) => {
    const dish = dishes.find(d => d.id === id);
    openDishModal(dish);
};

// --- 6. WAITER MODULE (ORDER TRACKING) ---
function renderWaiterBoard() {
    const statuses = ['Pendiente', 'Preparando', 'Listo', 'Entregado'];
    statuses.forEach(status => {
        const list = document.getElementById(`list-${status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`);
        const filtered = orders.filter(o => o.status === status);
        list.innerHTML = filtered.map(order => `
            <div class="order-ticket">
                <div class="ticket-header">
                    <span>#${order.id.toString().slice(-4)}</span>
                    <span style="background: var(--secondary); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">Mesa: ${order.table || 'N/A'}</span>
                </div>
                <div class="ticket-body">
                    <p style="font-weight: 700; margin-bottom: 5px; font-size: 0.9rem;"><i class="fas fa-user"></i> ${order.customer}</p>
                    <div class="ticket-items">
                        ${order.items.map(i => `${i.quantity}x ${i.name}`).join('<br>')}
                    </div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd; display: flex; justify-content: space-between; font-weight: 700; color: var(--primary);">
                        <span>Total:</span>
                        <span>$${order.total.toLocaleString('es-CO')}</span>
                    </div>
                </div>
                <div class="ticket-actions" style="margin-top: 15px;">
                    ${getNextStatusBtn(order)}
                    <button class="btn-secondary btn-block" onclick="generatePDF(${order.id})" style="margin-top: 5px; background: #57606f;">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                </div>
            </div>
        `).join('');
    });
}

function getNextStatusBtn(order) {
    const flow = { 'Pendiente': 'Preparando', 'Preparando': 'Listo', 'Listo': 'Entregado' };
    const next = flow[order.status];
    if (!next) return `<span class="badge success">Completado</span>`;
    return `<button class="btn-primary btn-block" onclick="updateOrderStatus(${order.id}, '${next}')">Pasar a ${next}</button>`;
}

window.updateOrderStatus = (id, newStatus) => {
    orders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    saveData('rest_orders', orders);
    renderWaiterBoard();
    showToast(`Pedido #${id.toString().slice(-4)} ahora está ${newStatus}`);
};

// --- 7. RESERVATION MODULE ---
function renderReservations() {
    const list = document.getElementById('reservations-list');
    const role = currentUser ? currentUser.role : 'client';
    
    let filtered = reservations;
    if (role === 'client') filtered = reservations.slice(-5);

    list.innerHTML = filtered.length ? filtered.map(res => `
        <div class="order-ticket" style="border-left-color: var(--accent)">
            <div class="ticket-header">
                <span><i class="fas fa-calendar"></i> ${res.date}</span>
                <span><i class="fas fa-clock"></i> ${res.time}</span>
            </div>
            <div class="ticket-items">
                <strong>${res.name}</strong> - ${res.people} personas
            </div>
        </div>
    `).reverse().join('') : '<p style="text-align:center; color:gray">No hay reservas aún.</p>';
}
function handleReservation(e) {
    e.preventDefault();
    const name = document.getElementById('res-name')?.value || (currentUser ? currentUser.name : 'Cliente Invitado');
    const phone = document.getElementById('res-phone')?.value || '';
    const email = document.getElementById('res-email')?.value || '';
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const people = document.getElementById('res-people').value;
    const notes = document.getElementById('res-notes')?.value || '';

    const newRes = {
        id: Date.now(),
        name,
        phone,
        email,
        date,
        time,
        people,
        notes,
        createdAt: new Date().toISOString()
    };

    reservations.push(newRes);
    saveData('rest_reservations', reservations);
    renderReservations();
    e.target.reset();
    showToast("Reserva guardada localmente");

    // Try sending the reservation to serverless endpoint (Vercel)
    try {
        const resp = await fetch('/api/send-reservation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRes)
        });
        if (resp.ok) {
            showToast('Reserva enviada al restaurante');
        } else {
            const error = await resp.json().catch(() => null);
            console.error('Reserva send error', error);
            openModal('Reserva (pendiente)', `<p>La reserva se guardó localmente pero no pudo notificarse automáticamente.</p><p>Detalles:</p><pre style="white-space:pre-wrap">${JSON.stringify(newRes, null, 2)}</pre>`);
            showToast('Reserva guardada localmente', 'danger');
        }
    } catch (err) {
        console.error(err);
        openModal('Reserva (pendiente)', `<p>La reserva se guardó localmente pero ocurrió un error al enviar la notificación automática.</p><pre style="white-space:pre-wrap">${JSON.stringify(newRes, null, 2)}</pre>`);
        showToast('Error al notificar reserva', 'danger');
    }
}

// --- 8.5 CUSTOMERS MODULE ---
function renderCustomersTable() {
    const tbody = document.getElementById('customers-table');
    tbody.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.nit}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>
                <button class="btn-icon delete" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openCustomerModal() {
    openModal("Nuevo Cliente", `
        <form id="customer-form">
            <div class="form-group"><label>Nombre / Razón Social</label><input type="text" id="cust-name" required></div>
            <div class="form-group"><label>NIT / RUT / Cédula</label><input type="text" id="cust-nit" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="cust-email"></div>
            <div class="form-group"><label>Teléfono</label><input type="text" id="cust-phone"></div>
            <button type="submit" class="btn-primary btn-block">Guardar Cliente</button>
        </form>
    `);

    document.getElementById('customer-form').onsubmit = (e) => {
        e.preventDefault();
        const newCust = {
            id: Date.now(),
            name: document.getElementById('cust-name').value,
            nit: document.getElementById('cust-nit').value,
            email: document.getElementById('cust-email').value,
            phone: document.getElementById('cust-phone').value
        };
        customers.push(newCust);
        saveData('rest_customers', customers);
        renderCustomersTable();
        closeModal();
        showToast("Cliente registrado");
    };
}

window.deleteCustomer = (id) => {
    if (confirm("¿Eliminar cliente?")) {
        customers = customers.filter(c => c.id !== id);
        saveData('rest_customers', customers);
        renderCustomersTable();
    }
};

// --- 8. REPORTS MODULE ---
function renderReports() {
    const todaySales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    document.getElementById('stat-today-sales').textContent = `$${todaySales.toLocaleString('es-CO')}`;
    document.getElementById('stat-total-orders').textContent = totalOrders;
    
    const historyTbody = document.getElementById('history-table');
    historyTbody.innerHTML = orders.map(o => `
        <tr>
            <td>#${o.id.toString().slice(-4)}</td>
            <td>${o.customer}</td>
            <td>$${o.total.toLocaleString('es-CO')}</td>
            <td>${o.status}</td>
            <td>
                <button class="btn-icon" onclick="generatePDF(${o.id})"><i class="fas fa-file-pdf"></i></button>
            </td>
        </tr>
    `).reverse().join('');
}

function handleCashClose() {
    if (confirm("¿Desea realizar el cierre de caja?")) {
        orders = [];
        saveData('rest_orders', orders);
        renderReports();
        showToast("Cierre de caja realizado");
    }
}

// --- 9. CORE APP LOGIC ---
function initApp() {
    updateNavigation();
    renderClientMenu();
    updateCartUI();
    setupCoreListeners();
}

function setupCoreListeners() {
    document.getElementById('logout-btn').onclick = handleLogout;
    document.getElementById('dish-search').oninput = (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderClientMenu();
    };
    
    document.getElementById('category-list').onclick = (e) => {
        if (e.target.tagName === 'LI') {
            activeCategory = e.target.dataset.category;
            document.querySelectorAll('#category-list li').forEach(li => li.classList.toggle('active', li === e.target));
            renderClientMenu();
        }
    };

    document.getElementById('cart-btn').onclick = toggleCart;
    document.getElementById('close-cart').onclick = toggleCart;
    document.getElementById('cart-overlay').onclick = toggleCart;
    document.getElementById('checkout-btn').onclick = openCheckoutModal;
    // Delivery option listeners (may not exist if DOM not loaded yet)
    document.querySelectorAll('input[name="delivery-mode"]').forEach(r => r.addEventListener('change', (e) => {
        deliveryMode = e.target.value;
        deliveryFee = deliveryMode === 'delivery' ? DELIVERY_FLAT : 0;
        const fields = document.getElementById('delivery-fields');
        if (fields) fields.style.display = deliveryMode === 'delivery' ? 'block' : 'none';
        const feeText = document.getElementById('delivery-fee-text');
        if (feeText) feeText.textContent = `$${deliveryFee.toLocaleString('es-CO')}`;
        updateCartUI();
    }));
    document.getElementById('btn-add-dish').onclick = () => openDishModal();
    document.getElementById('btn-add-customer').onclick = () => openCustomerModal();
    document.getElementById('res-form').onsubmit = handleReservation;
    document.getElementById('btn-cash-close').onclick = handleCashClose;
}

window.addToCart = (id) => {
    const dish = dishes.find(d => d.id === id);
    const item = cart.find(i => i.id === id);
    if (item) item.quantity++;
    else cart.push({ ...dish, quantity: 1 });
    saveCart();
    updateCartUI();
    showToast(`${dish.name} añadido`);
};

function updateCartUI() {
    const container = document.getElementById('cart-items');
    let subtotal = 0;
    container.innerHTML = cart.map(item => {
        subtotal += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toLocaleString('es-CO')}</p>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
    }).join('');
    // include delivery fee
    const total = subtotal + (deliveryFee || 0);
    document.getElementById('cart-total-price').textContent = `$${total.toLocaleString('es-CO')}`;
    document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

window.updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
};

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('cart-overlay').classList.toggle('active');
}

function openCheckoutModal() {
    if (!cart.length) return showToast("Carrito vacío", "danger");
    let customerOptions = customers.map(c => `<option value="${c.nit}">${c.name}</option>`).join('');
    
    openModal("Confirmar Pedido", `
        <form id="checkout-form">
            <div class="form-group">
                <label>Seleccionar Cliente Guardado</label>
                <select id="check-customer-select">
                    <option value="">-- Seleccionar --</option>
                    ${customerOptions}
                </select>
            </div>
            <div class="form-group"><label>Nombre Facturación</label><input type="text" id="check-name" placeholder="Nombre del cliente" required></div>
            <div class="form-group"><label>NIT / Cédula</label><input type="text" id="check-nit" placeholder="Para la factura" required></div>
            <div class="form-group"><label>Mesa / Dirección</label><input type="text" id="check-table" placeholder="Mesa 5 o Calle 123" required></div>
            <div class="form-group" style="display: flex; align-items: center; gap: 10px; background: #f8f9fa; padding: 10px; border-radius: 12px; margin-top: 20px;">
                <input type="checkbox" id="save-customer-chk" style="width: auto; margin: 0;">
                <label for="save-customer-chk" style="margin: 0; font-size: 0.85rem; cursor: pointer; color: var(--secondary); font-weight: 600;">Guardar cliente para futuras facturas</label>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; margin-top: 25px;">Confirmar Ahora</button>
        </form>
    `);

    const select = document.getElementById('check-customer-select');
    select.onchange = (e) => {
        const selected = customers.find(c => c.nit === e.target.value);
        if (selected) {
            document.getElementById('check-name').value = selected.name;
            document.getElementById('check-nit').value = selected.nit;
        }
    };
    
    document.getElementById('checkout-form').onsubmit = (e) => {
        e.preventDefault();
        const orderName = document.getElementById('check-name').value;
        const orderNit = document.getElementById('check-nit').value;
        // If delivery selected in sidebar, prefer that address
        const sidebarAddress = document.getElementById('delivery-address')?.value;
        const sidebarPhone = document.getElementById('delivery-phone')?.value;
        const orderTable = sidebarAddress && deliveryMode === 'delivery' ? sidebarAddress : document.getElementById('check-table').value;
        const saveChk = document.getElementById('save-customer-chk').checked;
        const order = {
            id: Date.now(),
            customer: orderName,
            nit: orderNit,
            table: orderTable,
            items: [...cart],
            subtotal: cart.reduce((s, i) => s + (i.price * i.quantity), 0),
            deliveryMode: deliveryMode,
            deliveryPhone: sidebarPhone || '',
            deliveryFee: deliveryFee || 0,
            total: cart.reduce((s, i) => s + (i.price * i.quantity), 0) + (deliveryFee || 0),
            status: 'Pendiente',
            date: new Date().toISOString()
        };

        // Save customer logic
        if (saveChk) {
            const exists = customers.find(c => c.nit === orderNit);
            if (!exists) {
                customers.push({ id: Date.now(), name: orderName, nit: orderNit, email: '', phone: '' });
                saveData('rest_customers', customers);
            }
        }

        orders.push(order);
        saveData('rest_orders', orders);
        cart = [];
        saveCart();
        updateCartUI();
        closeModal();
        toggleCart();
        showToast("Pedido enviado a cocina!");
    };
}

// --- UTILS ---
function openModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }
document.getElementById('close-modal').onclick = closeModal;

function showToast(msg, type = "success") {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.background = type === 'success' ? 'var(--accent)' : 'var(--danger)';
    t.classList.add('active');
    setTimeout(() => t.classList.remove('active'), 3000);
}

function saveData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function saveCart() { saveData('rest_cart', cart); }

// Start
document.getElementById('login-form').onsubmit = handleLogin;

document.addEventListener('click', (e) => {
    if (e.target.id === 'login-trigger' || e.target.closest('#login-trigger')) {
        document.getElementById('login-modal').classList.add('active');
    }
    if (e.target.id === 'close-login' || e.target.closest('#close-login')) {
        document.getElementById('login-modal').classList.remove('active');
    }
});

// Enhanced login UX: toggle password visibility, show credentials hint
document.getElementById('toggle-pass')?.addEventListener('click', () => {
    const pass = document.getElementById('login-pass');
    const btn = document.getElementById('toggle-pass');
    if (!pass) return;
    if (pass.type === 'password') { pass.type = 'text'; btn.innerHTML = '<i class="fas fa-eye-slash"></i>'; }
    else { pass.type = 'password'; btn.innerHTML = '<i class="fas fa-eye"></i>'; }
});

document.getElementById('show-credentials')?.addEventListener('click', (e) => {
    e.preventDefault();
    const hint = document.getElementById('cred-hint');
    if (hint) hint.classList.toggle('hidden');
});

// Simple 'remember me' using localStorage (client-only)
document.getElementById('login-form').addEventListener('submit', (e) => {
    const remember = document.getElementById('remember-me')?.checked;
    if (remember) {
        const user = document.getElementById('login-user').value;
        localStorage.setItem('rest_remember_user', user);
    } else {
        localStorage.removeItem('rest_remember_user');
    }
});

// On load, restore remembered username
window.addEventListener('DOMContentLoaded', () => {
    const remembered = localStorage.getItem('rest_remember_user');
    if (remembered) document.getElementById('login-user').value = remembered;
});

window.generatePDF = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff4757; margin: 0;">Gourmet Express</h1>
                <p>Comprobante de Pago Electrónico</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0;">
                <div>
                    <p><strong>CLIENTE:</strong> ${order.customer}</p>
                    <p><strong>NIT/C.C:</strong> ${order.nit || 'Sin registro'}</p>
                    <p><strong>UBICACIÓN:</strong> ${order.table}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>RECIBO #:</strong> ${order.id.toString().slice(-8)}</p>
                    <p><strong>FECHA:</strong> ${new Date(order.date).toLocaleString()}</p>
                </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <thead>
                    <tr style="background: #2f3542; color: white;">
                        <th style="padding: 12px; text-align: left;">DESCRIPCIÓN</th>
                        <th style="padding: 12px; text-align: center;">CANT.</th>
                        <th style="padding: 12px; text-align: right;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$${(item.price * item.quantity).toLocaleString('es-CO')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="text-align: right; font-weight: 800; font-size: 1.4rem; color: #ff4757;">
                TOTAL: $${order.total.toLocaleString('es-CO')}
            </div>
        </div>
    `;
    html2pdf().set({ margin: 0.5, filename: `Comprobante_${order.id}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(element).save();
};

try { initApp(); } catch (e) { console.error(e); }
