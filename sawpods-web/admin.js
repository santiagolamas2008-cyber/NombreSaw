// ================= CONFIGURACIÓN =================
const ADMIN_PASSWORD = '123456789';

// ================= PROTECCIÓN DE LA PÁGINA =================
window.addEventListener('DOMContentLoaded', () => {
    const yaLogueado = sessionStorage.getItem('podstore_admin_logged') === 'true';
    
    if (!yaLogueado) {
        const password = prompt('🔒 Acceso restringido. Ingresa la contraseña de administrador:');
        
        if (password === '123456789') {
            sessionStorage.setItem('podstore_admin_logged', 'true');
            location.reload();
        } else if (password !== null) {
            alert('❌ Contraseña incorrecta. Serás redirigido al inicio.');
            window.location.href = 'index.html';
        }
    } else {
        mostrarPanel();
    }
});

// ================= LOGIN =================
function loginAdmin() {
    const passwordInput = document.getElementById('admin-password').value;
    
    if (passwordInput === ADMIN_PASSWORD) {
        sessionStorage.setItem('podstore_admin_logged', 'true');
        mostrarPanel();
    } else {
        alert('❌ Contraseña incorrecta. Intenta de nuevo.');
        document.getElementById('admin-password').value = '';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('podstore_admin_logged');
    location.reload();
}

function mostrarPanel() {
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
    
    cargarPedidos();
}

// ================= CARGAR PEDIDOS =================
let filtroActual = 'Todos';

function cargarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('pedidosPodStore')) || [];
    
    actualizarEstadisticas(pedidos);
    
    const pedidosFiltrados = filtroActual === 'Todos' 
        ? pedidos 
        : pedidos.filter(p => p.estado === filtroActual);
    
    const tbody = document.getElementById('tabla-pedidos');
    const sinPedidos = document.getElementById('sin-pedidos');
    tbody.innerHTML = '';
    
    if (pedidosFiltrados.length === 0) {
        sinPedidos.style.display = 'block';
        tbody.parentElement.style.display = 'none';
        return;
    }
    
    sinPedidos.style.display = 'none';
    tbody.parentElement.style.display = 'table';
    
    // Ordenar por fecha descendente
    const pedidosOrdenados = [...pedidosFiltrados].reverse();
    
    pedidosOrdenados.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="pedido-id">${pedido.id}</td>
            <td>${pedido.fecha}</td>
            <td>${pedido.nombre}</td>
            <td>${pedido.telefono}</td>
            <td class="pedido-producto">${pedido.modelo} <br><small style="color: var(--text-muted)">${pedido.cantidad}</small></td>
            <td>${pedido.metodoPago}</td>
            <td><span class="estado-badge estado-${pedido.estado.toLowerCase()}">${pedido.estado}</span></td>
            <td>
                <div class="acciones">
                    <button class="btn-action" onclick="verDetallePedido('${pedido.id}')">👁️ Ver</button>
                    <button class="btn-action eliminar" onclick="eliminarPedido('${pedido.id}')">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ================= ESTADÍSTICAS =================
function actualizarEstadisticas(pedidos) {
    const total = pedidos.length;
    const pendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
    const enviados = pedidos.filter(p => p.estado === 'Enviado').length;
    
    const precios = { 'AirPods 2': 200, 'AirPods 3': 250, 'Cascos P9': 75 };
    
    let ingresos = 0;
    pedidos.forEach(p => {
        if (p.estado !== 'Cancelado') {
            let cantidadNum = 1;
            if (p.cantidad && p.cantidad.includes('Más de 3')) {
                cantidadNum = parseInt(p.cantidad) || 4;
            } else if (p.cantidad) {
                const match = p.cantidad.match(/\d+/);
                cantidadNum = match ? parseInt(match[0]) : 1;
            }
            ingresos += (precios[p.modelo] || 0) * cantidadNum;
        }
    });
    
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pendientes').innerText = pendientes;
    document.getElementById('stat-enviados').innerText = enviados;
    document.getElementById('stat-ingresos').innerText = ingresos + ' Bs';
}

// ================= FILTROS =================
function filtrarPedidos(estado, boton) {
    filtroActual = estado;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    boton.classList.add('active');
    cargarPedidos();
}

// ================= VER DETALLE =================
function verDetallePedido(id) {
    const pedidos = JSON.parse(localStorage.getItem('pedidosPodStore')) || [];
    const pedido = pedidos.find(p => p.id === id);
    
    if (!pedido) return;
    
    const modal = document.getElementById('modal-detalle');
    const body = document.getElementById('modal-body');
    const titulo = document.getElementById('modal-titulo');
    
    titulo.innerText = `Pedido ${pedido.id}`;
    
    body.innerHTML = `
        <div class="modal-row"><strong>Cliente:</strong> <span>${pedido.nombre}</span></div>
        <div class="modal-row"><strong>Teléfono:</strong> <span>+591 ${pedido.telefono}</span></div>
        <div class="modal-row"><strong>Producto:</strong> <span>${pedido.modelo}</span></div>
        <div class="modal-row"><strong>Cantidad:</strong> <span>${pedido.cantidad}</span></div>
        <div class="modal-row"><strong>Método de pago:</strong> <span>${pedido.metodoPago}</span></div>
        <div class="modal-row"><strong>Fecha:</strong> <span>${pedido.fecha}</span></div>
        <div class="modal-row"><strong>Notas:</strong> <span>${pedido.notas}</span></div>
        <div class="modal-row" style="margin-top: 15px; flex-direction: column; gap: 10px;">
            <strong style="margin-bottom: 8px;">Cambiar estado:</strong>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn-action" onclick="cambiarEstado('${pedido.id}', 'Pendiente')">⏳ Pendiente</button>
                <button class="btn-action" onclick="cambiarEstado('${pedido.id}', 'Confirmado')">✅ Confirmado</button>
                <button class="btn-action" onclick="cambiarEstado('${pedido.id}', 'Enviado')">🚚 Enviado</button>
                <button class="btn-action" onclick="cambiarEstado('${pedido.id}', 'Entregado')">🎉 Entregado</button>
                <button class="btn-action eliminar" onclick="cambiarEstado('${pedido.id}', 'Cancelado')">❌ Cancelar</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-detalle').style.display = 'none';
}

document.getElementById('modal-detalle').addEventListener('click', (e) => {
    if (e.target.id === 'modal-detalle') cerrarModal();
});

// ================= CAMBIAR ESTADO =================
function cambiarEstado(id, nuevoEstado) {
    let pedidos = JSON.parse(localStorage.getItem('pedidosPodStore')) || [];
    const index = pedidos.findIndex(p => p.id === id);
    
    if (index !== -1) {
        pedidos[index].estado = nuevoEstado;
        localStorage.setItem('pedidosPodStore', JSON.stringify(pedidos));
        cerrarModal();
        cargarPedidos();
    }
}

// ================= ELIMINAR PEDIDO =================
function eliminarPedido(id) {
    if (!confirm(`¿Estás seguro de eliminar el pedido ${id}? Esta acción no se puede deshacer.`)) return;
    
    let pedidos = JSON.parse(localStorage.getItem('pedidosPodStore')) || [];
    pedidos = pedidos.filter(p => p.id !== id);
    localStorage.setItem('pedidosPodStore', JSON.stringify(pedidos));
    cargarPedidos();
}

// ================= BORRAR TODO =================
function borrarTodosLosPedidos() {
    if (!confirm('⚠️ ¿Estás seguro de borrar TODOS los pedidos? Esta acción no se puede deshacer.')) return;
    
    localStorage.removeItem('pedidosPodStore');
    cargarPedidos();
}