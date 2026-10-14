// ================= CONFIGURACIÓN =================
const WHATSAPP_NUMERO = '59176466625'; // Tu número sin el +

// ================= FUNCIONES DE NAVEGACIÓN =================
function scrollToCatalogo() {
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
}

function scrollToReserva() {
    document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
}

// ================= ACCESO AL PANEL DE ADMIN =================
function accederAdmin() {
    const password = prompt('🔒 Ingresa la contraseña de administrador:');
    
    if (password === null) return;
    
    if (password === '123456789') {
        sessionStorage.setItem('podstore_admin_logged', 'true');
        window.location.href = 'admin.html';
    } else {
        alert('❌ Contraseña incorrecta. Acceso denegado.');
    }
}

// ================= SELECCIÓN DE PRODUCTO =================
function verDetalleProducto(modelo) {
    localStorage.setItem('modeloSeleccionado', modelo);
    window.location.href = 'producto.html';
}

// ================= CARGA DE DETALLE DEL PRODUCTO =================
function cargarDetalleProducto() {
    const modelo = localStorage.getItem('modeloSeleccionado');
    
    if (!modelo) {
        window.location.href = 'index.html#catalogo';
        return;
    }

    const baseDeDatos = {
        'AirPods 2': {
            titulo: 'AirPods 2',
            subtitulo: 'El clásico que nunca falla.',
            precio: '200',
            condicion: 'Excelente estado · Sin rayones',
            specs: [
                ['Batería auricular', 'Hasta 5 horas de audio'],
                ['Batería total (con estuche)', 'Hasta 24 horas'],
                ['Carga rápida', '15 min = 3 h de uso'],
                ['Bluetooth', 'v5.0 — alcance 10 m'],
                ['Chip', 'Apple H1'],
                ['Micrófonos', 'Doble beamforming'],
                ['Resistencia', 'No resistente al agua'],
                ['Emparejamiento', 'Conexión instantánea']
            ]
        },
        'AirPods 3': {
            titulo: 'AirPods 3',
            subtitulo: 'Audio espacial. Sonido sin límites.',
            precio: '250',
            condicion: 'Como nuevo · Caja original',
            specs: [
                ['Batería auricular', 'Hasta 6 horas de audio'],
                ['Batería total (con estuche)', 'Hasta 30 horas'],
                ['Carga rápida', '5 min = 1 h de uso'],
                ['Bluetooth', 'v5.0 — alcance 10 m'],
                ['Chip', 'Apple H1'],
                ['Micrófonos', 'Triple micrófono con reducción de ruido'],
                ['Resistencia', 'IPX4 (sudor y agua)'],
                ['Audio', 'Audio espacial adaptativo']
            ]
        },
        'Cascos P9': {
            titulo: 'Cascos P9',
            subtitulo: 'Sonido envolvente con cancelación.',
            precio: '75',
            condicion: 'Nuevos · Caja sellada',
            specs: [
                ['Batería', 'Hasta 20 horas de uso'],
                ['Modo de sonido', 'HiFi Estéreo'],
                ['Bluetooth', 'v5.3 — alcance 15 m'],
                ['Micrófono', 'Incorporado con cancelación'],
                ['Controles', 'Táctiles en el auricular'],
                ['Compatible con', 'Android y iOS'],
                ['Conectividad', 'Jack 3.5mm + Bluetooth'],
                ['Diseño', 'Over-ear plegable']
            ]
        }
    };

    const data = baseDeDatos[modelo];
    if (!data) return;

    document.getElementById('product-title').innerText = data.titulo;
    document.getElementById('product-subtitle').innerText = data.subtitulo;
    document.getElementById('product-price').innerText = data.precio;
    document.getElementById('product-condition').innerText = data.condicion;
    document.getElementById('product-badge').innerHTML = `<span class="dot"></span> STOCK DISPONIBLE · ${data.titulo.toUpperCase()}`;

    const specsList = document.getElementById('specs-list');
    specsList.innerHTML = '';
    data.specs.forEach(spec => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${spec[0]}</span> <span>${spec[1]}</span>`;
        specsList.appendChild(li);
    });
}

function irAReservar() {
    window.location.href = 'index.html#reservar';
}

function cambiarImagen(element) {
    document.querySelectorAll('.thumb').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}

// ================= MOSTRAR/OCULTAR CAMPO EXTRA =================
function toggleCantidadExtra() {
    const cantidadSelect = document.getElementById('cantidad');
    const cantidadExtra = document.getElementById('cantidad-extra');
    
    if (cantidadSelect.value === 'Más de 3') {
        cantidadExtra.style.display = 'block';
        cantidadExtra.required = true;
    } else {
        cantidadExtra.style.display = 'none';
        cantidadExtra.required = false;
        cantidadExtra.value = '';
    }
}

// ================= MÉTODOS DE PAGO =================
function selectPayment(element, metodo) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    const qrContainer = document.getElementById('qr-container');
    if (qrContainer) {
        if (metodo === 'qr') {
            qrContainer.style.display = 'block';
        } else {
            qrContainer.style.display = 'none';
        }
    }
}

// ================= ENVIAR RESERVA =================
function enviarReserva(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const modelo = document.getElementById('modelo-select').value;
    const notas = document.getElementById('notas').value.trim();
    
    const cantidadSelect = document.getElementById('cantidad').value;
    let cantidad = cantidadSelect;
    
    if (cantidadSelect === 'Más de 3') {
        const extra = document.getElementById('cantidad-extra').value;
        if (!extra || extra < 4) {
            alert('⚠️ Por favor, especifica una cantidad válida (mínimo 4 pares).');
            return;
        }
        cantidad = extra + ' pares';
    }
    
    const metodoPagoElement = document.querySelector('.payment-option.active');
    const metodoPago = metodoPagoElement ? metodoPagoElement.querySelector('strong').innerText : 'No especificado';

    if (!modelo) {
        alert('⚠️ Por favor, selecciona un modelo.');
        return;
    }

    // Generar número de pedido único
    const fecha = new Date();
    const numPedido = 'SP-' + 
        fecha.getFullYear().toString().slice(-2) + 
        (fecha.getMonth() + 1).toString().padStart(2, '0') + 
        fecha.getDate().toString().padStart(2, '0') + '-' + 
        Math.floor(Math.random() * 9000 + 1000);

    const nuevoPedido = {
        id: numPedido,
        fecha: fecha.toLocaleString('es-BO'),
        nombre: nombre,
        telefono: telefono,
        modelo: modelo,
        cantidad: cantidad,
        metodoPago: metodoPago,
        notas: notas || 'Sin notas adicionales',
        estado: 'Pendiente'
    };

    // Guardar en localStorage (cuenta admin)
    let pedidos = JSON.parse(localStorage.getItem('pedidosPodStore')) || [];
    pedidos.push(nuevoPedido);
    localStorage.setItem('pedidosPodStore', JSON.stringify(pedidos));

    // ========== ENVIAR A WHATSAPP AUTOMÁTICAMENTE ==========
    const mensajeWhatsApp = 
        `🛒 *NUEVA RESERVA - SawPods*%0A%0A` +
        `📦 *Pedido:* ${numPedido}%0A` +
        `👤 *Nombre:* ${nombre}%0A` +
        `📱 *Teléfono:* +591 ${telefono}%0A` +
        `🎧 *Modelo:* ${modelo}%0A` +
        `📊 *Cantidad:* ${cantidad}%0A` +
        `💳 *Método de pago:* ${metodoPago}%0A` +
        `📝 *Notas:* ${notas || 'Sin notas'}`;

    setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeWhatsApp}`, '_blank');
    }, 500);

    alert(`✅ ¡Reserva exitosa!\n\n📦 Número de pedido: ${numPedido}\n\nGracias ${nombre}, te contactaremos al +591 ${telefono} en menos de 2 horas.\n\nSe abrirá WhatsApp para enviarnos los detalles.`);

    document.getElementById('form-reserva').reset();
    
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
    const primerPago = document.querySelector('.payment-option');
    if (primerPago) primerPago.classList.add('active');

    const qrContainer = document.getElementById('qr-container');
    if (qrContainer) qrContainer.style.display = 'none';
    
    const cantidadExtra = document.getElementById('cantidad-extra');
    if (cantidadExtra) {
        cantidadExtra.style.display = 'none';
        cantidadExtra.required = false;
    }

    localStorage.removeItem('modeloSeleccionado');
}