const API_URL = "http://localhost:8080/api/salones";

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

export async function obtenerSalones() {
    const respuesta = await enviar(API_URL);
    return await procesarRespuesta(respuesta);
}

export async function obtenerSalonPorId(id) {
    const respuesta = await enviar(`${API_URL}/${id}`);
    return await procesarRespuesta(respuesta);
}
