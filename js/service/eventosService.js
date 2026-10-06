const API_URL = "http://localhost:8080/api/eventos";

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

export async function obtenerEventos() {
    const respuesta = await enviar(API_URL);
    return await procesarRespuesta(respuesta);
}

export async function obtenerEventoPorId(id) {
    const respuesta = await enviar(`${API_URL}/${id}`);
    return await procesarRespuesta(respuesta);
}

export async function crearEvento(evento) {
    const respuesta = await enviar(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(evento)
    });
    return await procesarRespuesta(respuesta);
}

export async function actualizarEvento(id, evento) {
    const respuesta = await enviar(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evento)
    });
    return await procesarRespuesta(respuesta);
}

export async function eliminarEvento(id) {
    const respuesta = await enviar(`${API_URL}/${id}`,
        {
            method: "DELETE"
        });
    return await procesarRespuesta(respuesta);
}
