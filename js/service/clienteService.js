const API_URL = "http://localhost:8080/api/clientes";

async function procesarRespuesta(respuesta) {
    let cuerpo = null;
    try {
        cuerpo = await respuesta.json();
    } catch (error) {
        cuerpo = null;
    }

    if (!respuesta.ok) {
        throw new Error(cuerpo && cuerpo.messaje ? cuerpo.messaje : `Error ${respuesta.status} del servidor`);
    }

    return cuerpo;
}

async function enviar(url, opciones) {
    try {
        return await fetch(url, opciones);
    } catch (error) {
        throw new Error("No se pudo conectar con el servidor");
    }
}

export async function obtenerClientes() {
    const respuesta = await enviar(API_URL);
    return await procesarRespuesta(respuesta);
}

export async function obtenerClientePorId(id) {
    const respuesta = await enviar(`${API_URL}/${id}`);
    return await procesarRespuesta(respuesta);
}

export async function crearCliente(cliente) {
    const respuesta = await enviar(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cliente)
    });
    return await procesarRespuesta(respuesta);
}

export async function actualizarCliente(id, cliente) {
    const respuesta = await enviar(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
    });
    return await procesarRespuesta(respuesta);
}

export async function eliminarCliente(id) {
    const respuesta = await enviar(`${API_URL}/${id}`,
        {
            method: "DELETE"
        });
    return await procesarRespuesta(respuesta);
}
