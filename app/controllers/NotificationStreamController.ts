// app/Controllers/Http/NotificationStreamController.ts

import { EventEmitter } from 'node:events' // <-- Importación correcta de EventEmitter para Node.js
import type { HttpContext } from '@adonisjs/core/http'

// Este EventEmitter se usa como un bus de eventos interno para comunicar
// los cambios de notificaciones a las conexiones SSE abiertas.
// Es importante que sea una única instancia global para que todos los controladores
// puedan emitir y este controlador pueda escuchar.
export const notificationEmitter = new EventEmitter()

export default class NotificationStreamController {
  /**
   * Maneja la conexión Server-Sent Events (SSE).
   * Mantiene la conexión abierta y envía eventos a los clientes cuando se emiten notificaciones.
   */
  public async stream({ response }: HttpContext) {
    // Configura los encabezados HTTP necesarios para una conexión SSE
    response.response.writeHead(200, {
      'Content-Type': 'text/event-stream', // Tipo de contenido para SSE
      'Cache-Control': 'no-cache', // Evita que el navegador cachee la respuesta
      'Connection': 'keep-alive', // Mantiene la conexión abierta
      'Access-Control-Allow-Origin': '*', // Permite solicitudes desde cualquier origen (ajustar en producción)
    })

    /**
     * Función auxiliar para enviar un evento SSE.
     * El formato es 'data: <JSON_DEL_EVENTO>\n\n'.
     */
    const sendEvent = (data: any) => {
      // JSON.stringify para convertir el objeto a string y reemplazar saltos de línea
      // para evitar problemas con el formato SSE.
      const dataString = JSON.stringify(data).replace(/\n/g, '\\n');
      response.response.write(`data: ${dataString}\n\n`);
      // No es necesario response.response.flushHeaders() aquí, writeHead ya ha enviado los headers.
      // write ya empuja los datos al stream.
    }

    /**
     * Listener que reacciona a los eventos emitidos por `notificationEmitter`.
     * Cuando se recibe un 'newNotification', se envía a través de la conexión SSE.
     */
    const listener = (notificationData: { id: number; ticketId: number; userId: number; message: string; title: string; statusId?: number }) => {
      // Envía la data de la notificación a través de la conexión SSE.
      // El frontend deberá usar `userId` para filtrar y mostrar notificaciones relevantes.
      sendEvent({
        type: 'new_notification', // Tipo de evento para que el frontend pueda distinguirlo
        id: notificationData.id,
        ticketId: notificationData.ticketId,
        userId: notificationData.userId, // ID del usuario al que va dirigida la notificación
        message: notificationData.message,
        title: notificationData.title,
        statusId: notificationData.statusId, // Incluir statusId
        timestamp: new Date().toISOString() // Marca de tiempo de cuándo se envió la notificación
      })
      console.log(`[NotificationStreamController] Notificación enviada a cliente SSE: Ticket ID ${notificationData.ticketId}, User ID ${notificationData.userId}`);
    }

    // Suscribe este listener al evento 'newNotification' del emisor global
    notificationEmitter.on('newNotification', listener)
    console.log('[NotificationStreamController] Conexión SSE abierta para un cliente y escuchando "newNotification".');

    // --- Lógica para enviar Heartbeats ---
    // Envía un comentario SSE (':\n\n') cada X segundos para mantener la conexión viva
    // y evitar timeouts de proxies o balanceadores de carga.
    const heartbeatInterval = setInterval(() => {
      response.response.write(':\n\n'); // Un comentario SSE para heartbeat
      console.log('[NotificationStreamController] Enviando heartbeat SSE.');
    }, 25000); // Cada 25 segundos (ajustable)

    // Maneja la desconexión del cliente:
    // Cuando la conexión se cierra (por ejemplo, el usuario cierra la pestaña o actualiza),
    // se elimina el listener para evitar fugas de memoria y se finaliza la respuesta.
    response.response.on('close', () => {
      notificationEmitter.off('newNotification', listener) // Desuscribe el listener
      clearInterval(heartbeatInterval); // Limpia el intervalo del heartbeat
      response.response.end() // Finaliza la respuesta HTTP
      console.log('Conexión SSE cerrada para un cliente. Listener y heartbeat limpiados.'); // Log para depuración
    })
  }
}