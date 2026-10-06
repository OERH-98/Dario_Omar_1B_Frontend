import {
    obtenerEventos,
    obtenerEventoPorId,
    crearEvento,
    actualizarEvento,
    eliminarEvento
} from "../service/eventosService.js";
import { obtenerClientes } from "../service/clienteService.js";
import { obtenerSalones } from "../service/salonService.js";

const formulario = document.getElementById("formEvento");
const tituloFormulario = document.getElementById("idFormulario");
const tabla = document.getElementById("tablaEventos");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const grupoEstado = document.getElementById("grupoEstado");

const campos = {
    cliente: document.getElementById("idCliente"),
    salon: document.getElementById("idSalon"),
    nombre: document.getElementById("txtNombreEvento"),
    fecha: document.getElementById("txtFechaEvento"),
    personas: document.getElementById("txtCantidadParticipantes"),
    horas: document.getElementById("txtDuracionEvento"),
    estado: document.getElementById("txtEstado")
};

let idEditando = null;

function mostrarAlerta(mensaje, icono) {
    Swal.fire({
        icon: icono,
        text: mensaje,
        confirmButtonText: "Aceptar"
    });
}

async function confirmarEliminacion(texto) {
    const resultado = await Swal.fire({
        icon: "warning",
        title: "¿Estas seguro?",
        text: texto,
        showCancelButton: true,
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "Cancelar"
    });
    return resultado.isConfirmed;
}

function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto ?? "";
    return td;
}

function botonAccion(texto, clase, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = `btn btn-sm ${clase} me-1`;
    boton.textContent = texto;
    boton.addEventListener("click", accion);
    return boton;
}

function llenarSelect(select, items, valor, texto, placeholder) {
    select.replaceChildren();

    const base = document.createElement("option");
    base.value = "";
    base.textContent = placeholder;
    select.appendChild(base);

    items.forEach(item => {
        const opcion = document.createElement("option");
        opcion.value = item[valor];
        opcion.textContent = texto(item);
        select.appendChild(opcion);
    });
}

async function cargarSelects() {
    try {
        const [clientes, salones] = await Promise.all([obtenerClientes(), obtenerSalones()]);
        llenarSelect(campos.cliente, clientes.data, "id_cliente", c => `${c.nombre} ${c.apellido}`, "Selecciona un cliente");
        llenarSelect(campos.salon, salones.data, "id_salon", s => `${s.nombre_salon} (capacidad ${s.capacidad})`, "Selecciona un salon");
    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
}

function leerFormulario() {
    const evento = {
        id_cliente: Number(campos.cliente.value),
        id_salon: Number(campos.salon.value),
        nombre_evento: campos.nombre.value.trim(),
        fecha_evento: campos.fecha.value,
        cantidad_personas: Number(campos.personas.value),
        cantidad_horas: Number(campos.horas.value)
    };
    if (idEditando !== null) evento.estado = campos.estado.value;
    return evento;
}

function validar(evento) {
    if (!evento.id_cliente) return "Selecciona un cliente";
    if (!evento.id_salon) return "Selecciona un salon";
    if (!evento.nombre_evento) return "El nombre del evento es obligatorio";
    if (evento.nombre_evento.length > 100) return "El nombre del evento no puede exceder 100 caracteres";
    if (!evento.fecha_evento) return "La fecha del evento es obligatoria";
    if (!Number.isInteger(evento.cantidad_personas) || evento.cantidad_personas <= 0) return "La cantidad de personas debe ser un entero mayor a 0";
    if (!Number.isInteger(evento.cantidad_horas) || evento.cantidad_horas < 1 || evento.cantidad_horas > 24) return "La cantidad de horas debe ser un entero entre 1 y 24";
    return null;
}

function reiniciarFormulario() {
    formulario.reset();
    idEditando = null;
    tituloFormulario.textContent = "Registrar evento";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("d-none");
    grupoEstado.classList.add("d-none");
}

function formatearDinero(valor) {
    return Number(valor).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pintarTabla(eventos) {
    tabla.replaceChildren();

    if (eventos.length === 0) {
        const fila = document.createElement("tr");
        const td = celda("No hay eventos registrados");
        td.colSpan = 9;
        td.className = "text-center text-muted";
        fila.appendChild(td);
        tabla.appendChild(fila);
        return;
    }

    eventos.forEach(evento => {
        const fila = document.createElement("tr");
        fila.appendChild(celda(evento.nombre_cliente));
        fila.appendChild(celda(evento.nombre_salon));
        fila.appendChild(celda(evento.nombre_evento));
        fila.appendChild(celda(evento.fecha_evento));
        fila.appendChild(celda(evento.cantidad_personas));
        fila.appendChild(celda(evento.cantidad_horas));
        fila.appendChild(celda(formatearDinero(evento.total_pago)));
        fila.appendChild(celda(evento.estado));

        const acciones = document.createElement("td");
        acciones.appendChild(botonAccion("Editar", "btn-warning", () => prepararEdicion(evento.id_evento)));
        acciones.appendChild(botonAccion("Eliminar", "btn-danger", () => borrar(evento.id_evento)));
        fila.appendChild(acciones);

        tabla.appendChild(fila);
    });
}

async function cargarEventos() {
    try {
        const respuesta = await obtenerEventos();
        pintarTabla(respuesta.data);
    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
}

async function prepararEdicion(id) {
    try {
        const respuesta = await obtenerEventoPorId(id);
        const evento = respuesta.data;
        campos.cliente.value = evento.id_cliente;
        campos.salon.value = evento.id_salon;
        campos.nombre.value = evento.nombre_evento;
        campos.fecha.value = evento.fecha_evento;
        campos.personas.value = evento.cantidad_personas;
        campos.horas.value = evento.cantidad_horas;
        campos.estado.value = evento.estado;

        idEditando = id;
        tituloFormulario.textContent = "Editar evento";
        btnGuardar.textContent = "Actualizar";
        btnCancelar.classList.remove("d-none");
        grupoEstado.classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
}

async function borrar(id) {
    if (!await confirmarEliminacion("Se eliminara este evento de forma permanente")) return;

    try {
        const respuesta = await eliminarEvento(id);
        mostrarAlerta(respuesta.messaje, "success");
        if (idEditando === id) reiniciarFormulario();
        await cargarEventos();
    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
}

formulario.addEventListener("submit", async e => {
    e.preventDefault();

    const evento = leerFormulario();
    const error = validar(evento);
    if (error) {
        mostrarAlerta(error, "warning");
        return;
    }

    try {
        const respuesta = idEditando === null
            ? await crearEvento(evento)
            : await actualizarEvento(idEditando, evento);
        mostrarAlerta(respuesta.messaje, "success");
        reiniciarFormulario();
        await cargarEventos();
    } catch (err) {
        mostrarAlerta(err.message, "error");
    }
});

btnCancelar.addEventListener("click", reiniciarFormulario);

cargarSelects();
cargarEventos();
