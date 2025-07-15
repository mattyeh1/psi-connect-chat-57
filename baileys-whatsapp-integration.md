
# Integración de WhatsApp con Baileys para Notificaciones

## Configuración del Workflow de n8n

### Variables de Entorno Requeridas
En n8n, configura las siguientes variables:
- `BAILEYS_WEBHOOK_URL`: URL de tu servidor con Baileys
- `BAILEYS_API_KEY`: Clave de API para autenticación
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_ANON_KEY`: Clave anónima de Supabase

### Credenciales de Supabase
1. Ve a Settings > Credentials en n8n
2. Crea una nueva credencial "Supabase"
3. Ingresa tu URL de Supabase y Service Role Key

### Estructura del Workflow

#### 1. Monitor Notifications
- **Tipo**: Supabase Trigger
- **Función**: Monitorea la tabla `system_notifications` cada minuto
- **Filtros**: `delivery_method = 'whatsapp'` y `status = 'pending'`

#### 2. Filter WhatsApp Notifications
- **Tipo**: IF Node
- **Función**: Filtra solo notificaciones de WhatsApp pendientes

#### 3. Check Template
- **Tipo**: IF Node
- **Función**: Verifica si usar plantilla o mensaje directo

#### 4. Send WhatsApp Message / Send Template Message
- **Tipo**: HTTP Request
- **Función**: Envía mensaje a través de Baileys
- **Endpoint**: `/send-message` o `/send-template`

#### 5. Update Status
- **Tipo**: Supabase Update
- **Función**: Actualiza el estado de la notificación

## Configuración del Servidor Baileys

### Estructura de API Endpoints

```javascript
// /send-message
POST /send-message
{
  "to": "5491123456789",
  "message": "Tu cita está programada para mañana",
  "type": "text"
}

// /send-template
POST /send-template
{
  "to": "5491123456789",
  "template": "appointment_reminder_template",
  "variables": {
    "patient_name": "Juan Pérez",
    "appointment_date": "2024-06-24",
    "appointment_time": "15:00"
  }
}

// /get-status
GET /get-status
Response: { "status": "connected" | "disconnected" }

// /initialize
POST /initialize
```

### Configuración de Metadata en Notificaciones

Para que el workflow funcione correctamente, las notificaciones deben incluir:

```json
{
  "metadata": {
    "phone_number": "5491123456789",
    "use_template": true,
    "template_variables": {
      "patient_name": "Juan Pérez",
      "appointment_date": "2024-06-24",
      "appointment_time": "15:00"
    }
  }
}
```

## Plantillas de WhatsApp Sugeridas

### 1. Recordatorio de Cita
```
Hola {{patient_name}}, te recordamos tu cita con el Dr. {{psychologist_name}} el {{appointment_date}} a las {{appointment_time}}. 
¡Te esperamos!
```

### 2. Pago Pendiente
```
Hola {{patient_name}}, tienes un pago pendiente de ${{amount}} por tu sesión del {{session_date}}. 
Puedes realizar el pago a través de {{payment_link}}.
```

### 3. Documento Listo
```
Hola {{patient_name}}, tu {{document_type}} está listo para ser revisado. 
Puedes acceder desde tu portal de paciente.
```

## Estados del Workflow

- **pending**: Notificación creada, esperando envío
- **sent**: Mensaje enviado exitosamente
- **failed**: Error en el envío
- **delivered**: Mensaje entregado (requiere webhook de confirmación)

## Manejo de Errores

El workflow incluye manejo de errores para:
- Conexión perdida con WhatsApp
- Números de teléfono inválidos
- Fallos en el servidor Baileys
- Límites de velocidad de WhatsApp

## Monitoreo y Logs

- Todos los envíos se registran en `system_notifications`
- Errores se almacenan en el campo `metadata`
- Estados se actualizan en tiempo real
- Logs detallados en n8n para debugging
