import {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
} from "../service/clienteService.js";

const formulario = document.getElementById("formCliente");
const tituloFormulario = document.getElementById("idFormulario");
const tabla = document.getElementById("tablaClientes");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

const campos = {
    nombre: document.getElementById("txtNombre"),
    apellido: document.getElementById("txtApellido"),
    telefono: document.getElementById("txtTelefono"),
    email: document.getElementById("txtEmail"),
    direccion: document.getElementById("txtDireccion")
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

function leerFormulario() {
    return {
        nombre: campos.nombre.value.trim(),
        apellido: campos.apellido.value.trim(),
        telefono: campos.telefono.value.trim(),
        email: campos.email.value.trim(),
        direccion: campos.direccion.value.trim()
    };
}

function validar(cliente) {
    if (!cliente.nombre) return "El nombre es obligatorio";
    if (!cliente.apellido) return "El apellido es obligatorio";
    if (!cliente.telefono) return "El telefono es obligatorio";
    if (!/^[0-9+() -]{7,15}$/.test(cliente.telefono)) return "El telefono debe tener entre 7 y 15 caracteres validos";
    if (!cliente.email) return "El email es obligatorio";
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(cliente.email)) return "El email no tiene un formato valido";
    if (!cliente.direccion) return "La direccion es obligatoria";
    return null;
}

function reiniciarFormulario() {
    formulario.reset();
    idEditando = null;
    tituloFormulario.textContent = "Registrar cliente";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("d-none");
}

function pintarTabla(clientes) {
    tabla.replaceChildren();

    if (clientes.length === 0) {
        const fila = document.createElement("tr");
        const td = celda("No hay clientes registrados");
        td.colSpan = 7;
        td.className = "text-center text-muted";
        fila.appendChild(td);
        tabla.appendChild(fila);
        return;
    }

    clientes.forEach(cliente => {
        const fila = document.createElement("tr");
        fila.appendChild(celda(cliente.id_cliente));
        fila.appendChild(celda(cliente.nombre));
        fila.appendChild(celda(cliente.apellido));
        fila.appendChild(celda(cliente.telefono));
        fila.appendChild(celda(cliente.email));
        fila.appendChild(celda(cliente.direccion));

        const acciones = document.createElement("td");
        acciones.appendChild(botonAccion("Editar", "btn-warning", () => prepararEdicion(cliente.id_cliente)));
        acciones.appendChild(botonAccion("Eliminar", "btn-danger", () => borrar(cliente.id_cliente)));
        fila.appendChild(acciones);

        tabla.appendChild(fila);
    });
}

async function cargarClientes() {
    try {
        const respuesta = await obtenerClientes();
        pintarTabla(respuesta.data);
    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
}

async function prepararEdicion(id) {
    try {
        const respuesta = await obtenerClientePorId(id);
        const cliente = respuesta.data;
        campos.nombre.value = cliente.nombre;
        campos.apellido.value = cliente.apellido;
        campos.telefono.value = cliente.telefono;
        campos.email.value = cliente.email;
        campos.direccion.value = cliente.direccion;

        idEditando = id;
        tituloFormulario.textContent = "Editar cliente";
        btnGuardar.textContent = "Actualizar";
        btnCancelar.classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
}

async function borrar(id) {
    if (!await confirmarEliminacion("Se eliminara este cliente de forma permanente")) return;

    try {
        const respuesta = await eliminarCliente(id);
        mostrarAlerta(respuesta.messaje, "success");
        if (idEditando === id) reiniciarFormulario();
        await cargarClientes();
    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const cliente = leerFormulario();
    const error = validar(cliente);
    if (error) {
        mostrarAlerta(error, "warning");
        return;
    }

    try {
        const respuesta = idEditando === null
            ? await crearCliente(cliente)
            : await actualizarCliente(idEditando, cliente);
        mostrarAlerta(respuesta.messaje, "success");
        reiniciarFormulario();
        await cargarClientes();
    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
});

btnCancelar.addEventListener("click", reiniciarFormulario);

cargarClientes();
