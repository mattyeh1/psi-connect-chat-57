
# Configuración Completa del Sistema de Notificaciones WhatsApp

## 📋 Checklist de Implementación

### ✅ 1. Preparación del Servidor Baileys

#### Instalación y Configuración
```bash
# 1. Crear directorio del proyecto
mkdir baileys-whatsapp-server
cd baileys-whatsapp-server

# 2. Copiar archivos del proyecto
# - baileys-server-optimized.js
# - package-baileys.json (renombrar a package.json)

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
echo 'BAILEYS_API_KEY=tu-clave-super-secreta-aqui' > .env
echo 'PORT=3001' >> .env

# 5. Iniciar servidor
npm start
```

#### Verificación del Servidor
- [ ] Servidor iniciado en puerto 3001
- [ ] Código QR generado para WhatsApp Web
- [ ] Escanear QR con WhatsApp móvil
- [ ] Estado "connected" en `/get-status`

### ✅ 2. Configuración de n8n

#### Variables de Entorno en n8n
```javascript
BAILEYS_WEBHOOK_URL=http://tu-servidor:3001
BAILEYS_API_KEY=tu-clave-super-secreta-aqui
SUPABASE_URL=https://scikpgzpgzevkgwwobrf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

#### Credenciales de Supabase
1. Ir a **Settings > Credentials** en n8n
2. Crear nueva credencial "Supabase API"
3. Configurar:
   - **URL**: `https://scikpgzpgzevkgwwobrf.supabase.co`
   - **Service Role Key**: Tu clave de servicio

#### Importar Workflow
1. Copiar contenido de `n8n-whatsapp-workflow-complete.json`
2. En n8n: **Import from JSON**
3. Pegar el JSON y importar
4. Activar el workflow

### ✅ 3. Estructura de Notificaciones en la Base de Datos

#### Formato de Metadata para WhatsApp
```json
{
  "phone_number": "5491123456789",
  "use_template": true,
  "template_variables": {
    "patient_name": "Juan Pérez",
    "psychologist_name": "Dra. María González",
    "appointment_date": "24/06/2024", 
    "appointment_time": "15:00",
    "amount": "5000",
    "session_date": "20/06/2024",
    "document_type": "Informe Psicológico"
  }
}
```

#### Ejemplo de Inserción de Notificación
```sql
INSERT INTO system_notifications (
  recipient_id,
  recipient_type,
  notification_type,
  title,
  message,
  status,
  scheduled_for,
  delivery_method,
  metadata
) VALUES (
  'uuid-del-paciente',
  'patient',
  'appointment_reminder',
  'Recordatorio de Cita',
  'Tienes una cita programada',
  'pending',
  NOW() + INTERVAL '1 minute',
  'whatsapp',
  '{
    "phone_number": "5491123456789",
    "use_template": true,
    "template_variables": {
      "patient_name": "Juan Pérez",
      "psychologist_name": "Dra. María González", 
      "appointment_date": "24/06/2024",
      "appointment_time": "15:00"
    }
  }'::jsonb
);
```

### ✅ 4. Plantillas Disponibles

#### 1. Recordatorio de Cita (`appointment_reminder_template`)
**Variables:**
- `patient_name`: Nombre del paciente
- `psychologist_name`: Nombre del psicólogo
- `appointment_date`: Fecha de la cita (DD/MM/YYYY)
- `appointment_time`: Hora de la cita (HH:MM)

#### 2. Pago Pendiente (`payment_due_template`)
**Variables:**
- `patient_name`: Nombre del paciente
- `amount`: Monto a pagar
- `session_date`: Fecha de la sesión
- `payment_link`: Enlace para realizar el pago

#### 3. Documento Listo (`document_ready_template`)
**Variables:**
- `patient_name`: Nombre del paciente
- `document_type`: Tipo de documento

#### 4. Pago Confirmado (`payment_confirmed_template`)
**Variables:**
- `patient_name`: Nombre del paciente
- `amount`: Monto pagado
- `payment_date`: Fecha del pago
- `payment_reference`: Referencia del pago

#### 5. Cita Confirmada (`appointment_confirmed_template`)
**Variables:**
- `patient_name`: Nombre del paciente
- `psychologist_name`: Nombre del psicólogo
- `appointment_date`: Fecha de la cita
- `appointment_time`: Hora de la cita
- `session_type`: Tipo de sesión (presencial/virtual)

### ✅ 5. Endpoints del Servidor Baileys

#### Principales Endpoints
```javascript
GET  /health                    // Estado del sistema
GET  /get-status               // Estado de WhatsApp
GET  /get-qr                   // Obtener código QR
POST /initialize               // Inicializar WhatsApp
POST /restart                  // Reiniciar conexión
POST /send-message             // Enviar mensaje directo
POST /send-template           // Enviar con plantilla
POST /check-number            // Verificar número
GET  /templates               // Plantillas disponibles
POST /webhook/delivery        // Confirmaciones de entrega
```

#### Ejemplo de Uso con curl
```bash
# Verificar estado
curl -H "Authorization: Bearer tu-api-key" \
     http://localhost:3001/get-status

# Enviar mensaje directo
curl -X POST \
     -H "Authorization: Bearer tu-api-key" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "5491123456789",
       "message": "Hola, este es un mensaje de prueba"
     }' \
     http://localhost:3001/send-message

# Enviar con plantilla
curl -X POST \
     -H "Authorization: Bearer tu-api-key" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "5491123456789",
       "template": "appointment_reminder_template",
       "variables": {
         "patient_name": "Juan Pérez",
         "psychologist_name": "Dra. María González",
         "appointment_date": "24/06/2024",
         "appointment_time": "15:00"
       }
     }' \
     http://localhost:3001/send-template
```

### ✅ 6. Monitoreo y Logs

#### Estados de Notificación
- **pending**: Creada, esperando envío
- **sent**: Enviada exitosamente
- **failed**: Error en el envío
- **delivered**: Entregada (opcional con webhook)

#### Logs del Servidor Baileys
```bash
# Ver logs en tiempo real
tail -f logs/baileys.log

# Con PM2
pm2 logs baileys-server
```

#### Logs de n8n
- Ir a **Executions** en n8n
- Revisar logs detallados de cada ejecución
- Monitorear errores y reintentos

### ✅ 7. Troubleshooting

#### Problemas Comunes

**1. WhatsApp no conecta**
- Verificar que el código QR sea reciente
- Asegurar conexión a internet estable
- Revisar logs del servidor

**2. Mensajes no se envían**
- Verificar formato del número de teléfono
- Confirmar que el número tenga WhatsApp
- Revisar límites de velocidad

**3. n8n no encuentra notificaciones**
- Verificar credenciales de Supabase
- Confirmar formato de fechas en `scheduled_for`
- Revisar filtros del workflow

**4. Plantillas no funcionan**
- Verificar nombres de plantillas
- Confirmar formato de variables
- Revisar estructura del JSON en metadata

#### Comandos de Diagnóstico
```bash
# Estado del servidor
curl http://localhost:3001/health

# Verificar número de WhatsApp
curl -X POST \
     -H "Authorization: Bearer tu-api-key" \
     -H "Content-Type: application/json" \
     -d '{"phone": "5491123456789"}' \
     http://localhost:3001/check-number

# Obtener plantillas disponibles
curl -H "Authorization: Bearer tu-api-key" \
     http://localhost:3001/templates
```

### ✅ 8. Producción y Escalabilidad

#### Configuración con PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start baileys-server-optimized.js --name baileys-server

# Configurar auto-restart
pm2 startup
pm2 save
```

#### Configuración de Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Variables de Entorno de Producción
```bash
NODE_ENV=production
PORT=3001
BAILEYS_API_KEY=clave-super-segura-produccion
LOG_LEVEL=error
MAX_RETRIES=3
TIMEOUT_MS=15000
```

### ✅ 9. Integración con el Sistema Existente

#### Modificar Funciones de Creación de Citas
```typescript
// Ejemplo de integración en el sistema
const createAppointmentNotification = async (appointmentData) => {
  const { data, error } = await supabase
    .from('system_notifications')
    .insert({
      recipient_id: appointmentData.patient_id,
      recipient_type: 'patient', 
      notification_type: 'appointment_reminder',
      title: 'Recordatorio de Cita',
      message: 'Tienes una cita programada',
      status: 'pending',
      scheduled_for: new Date(appointmentData.appointment_date.getTime() - 24 * 60 * 60 * 1000), // 24 horas antes
      delivery_method: 'whatsapp',
      metadata: {
        phone_number: appointmentData.patient_phone,
        use_template: true,
        template_variables: {
          patient_name: appointmentData.patient_name,
          psychologist_name: appointmentData.psychologist_name,
          appointment_date: appointmentData.appointment_date.toLocaleDateString('es-ES'),
          appointment_time: appointmentData.appointment_date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
      }
    });
    
  if (error) {
    console.error('Error creando notificación:', error);
  }
};
```

### 🎯 Testing Final

#### Prueba Completa del Sistema
1. **Iniciar servidor Baileys** ✅
2. **Conectar WhatsApp Web** ✅
3. **Activar workflow n8n** ✅
4. **Crear notificación de prueba** ✅
5. **Verificar envío en WhatsApp** ✅
6. **Confirmar actualización de estado** ✅

#### Script de Prueba SQL
```sql
-- Crear notificación de prueba
INSERT INTO system_notifications (
  recipient_id,
  recipient_type,
  notification_type,
  title,
  message,
  status,
  scheduled_for,
  delivery_method,
  metadata
) VALUES (
  gen_random_uuid(),
  'patient',
  'appointment_reminder',
  'Prueba del Sistema',
  'Este es un mensaje de prueba',
  'pending',
  NOW(),
  'whatsapp',
  '{
    "phone_number": "TU_NUMERO_DE_TELEFONO",
    "use_template": false
  }'::jsonb
);
```

¡Sistema implementado y listo para usar! 🚀
