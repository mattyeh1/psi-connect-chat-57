
# 🚀 WhatsApp Ultra Server v3.0 - Enterprise Edition

## Servidor Ultra-Optimizado para Sistema de Psicólogos con Integración Supabase

### ✨ Características Ultra-Avanzadas

#### 🔧 **Sistema de Conexión Robusto**
- ✅ Auto-reconexión inteligente con backoff exponencial
- ✅ Manejo avanzado de QR con regeneración automática
- ✅ Múltiples instancias para alta disponibilidad
- ✅ Health checks automáticos cada 30 segundos
- ✅ Persistencia de sesión mejorada con cifrado

#### 🌐 **APIs Enterprise-Level**
- ✅ Autenticación JWT con tokens rotativos
- ✅ Rate limiting inteligente por usuario
- ✅ Validación exhaustiva de números argentinos
- ✅ Plantillas dinámicas con variables personalizadas
- ✅ Webhook callbacks para confirmaciones de entrega
- ✅ Métricas en tiempo real y logging avanzado

#### 👨‍⚕️ **Funciones Específicas para Psicólogos**
- ✅ Recordatorios de citas con múltiples plantillas
- ✅ Confirmaciones de pago automáticas
- ✅ Notificaciones de documentos listos
- ✅ Mensajes de seguimiento post-sesión
- ✅ Alertas de emergencia con prioridad alta
- ✅ Programación inteligente de mensajes

#### 🗄️ **Integración Total con Supabase**
- ✅ Sincronización automática con `system_notifications`
- ✅ Actualización de estados en tiempo real
- ✅ Logs de entrega detallados
- ✅ Retry automático para mensajes fallidos
- ✅ Backup de mensajes en base de datos

#### 🤖 **Características Ultra-Avanzadas**
- ✅ IA para optimización de horarios de envío
- ✅ Análisis de sentimiento en respuestas
- ✅ Auto-respuestas inteligentes basadas en contexto
- ✅ Detección de spam y filtros de seguridad
- ✅ Métricas avanzadas de engagement
- ✅ Dashboard en tiempo real con WebSockets

#### 🔒 **Seguridad y Compliance**
- ✅ Cifrado end-to-end para datos sensibles
- ✅ Auditoría completa de todas las acciones
- ✅ Compliance GDPR y normativas de salud
- ✅ Backup automático de conversaciones
- ✅ Anonimización de datos sensibles

#### ⚡ **Escalabilidad y Performance**
- ✅ Clustering automático para múltiples instancias
- ✅ Load balancing inteligente
- ✅ Cache distribuido con Redis
- ✅ Optimización de memoria y CPU
- ✅ Auto-scaling basado en carga

#### 📊 **Monitoreo y Alertas**
- ✅ Dashboard completo con métricas en vivo
- ✅ Alertas automáticas por email/SMS
- ✅ Reportes diarios/semanales/mensuales
- ✅ Análisis predictivo de fallos
- ✅ Optimización automática de performance

---

## 🚀 Instalación Rápida

### 1. Prerrequisitos
```bash
# Node.js 18+ requerido
node --version  # v18.0.0 o superior
npm --version   # 8.0.0 o superior
```

### 2. Instalación Automática
```bash
# Clonar archivos del proyecto
curl -O https://raw.githubusercontent.com/tu-repo/whatsapp-ultra/main/setup-ultra.sh
chmod +x setup-ultra.sh
./setup-ultra.sh
```

### 3. Instalación Manual
```bash
# Copiar archivos del proyecto
cp whatsapp-server-v3-ultra.js .
cp package-ultra.json package.json
cp setup-ultra.sh .

# Instalar dependencias
npm install

# Configurar permisos
chmod +x setup-ultra.sh whatsapp-server-v3-ultra.js
./setup-ultra.sh
```

---

## 🎯 Uso Rápido

### Iniciar Servidor
```bash
# Método 1: Script de inicio (recomendado)
./start-ultra.sh

# Método 2: Inicio directo
node whatsapp-server-v3-ultra.js

# Método 3: Con clustering (producción)
NODE_ENV=production CLUSTERING_ENABLED=true node whatsapp-server-v3-ultra.js
```

### Verificar Estado
```bash
# Estado completo
./monitor-ultra.sh all

# Solo WhatsApp
./monitor-ultra.sh whatsapp

# Solo servidor
./monitor-ultra.sh health

# Métricas detalladas
./monitor-ultra.sh metrics
```

---

## 📡 APIs Disponibles

### 🔐 Autenticación
```bash
# Obtener token JWT
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ultra-secure-2024"}'
```

### 📱 Estado del Sistema
```bash
# Estado general
curl http://localhost:3001/api/status

# Health check
curl http://localhost:3001/health

# Métricas detalladas (requiere auth)
curl http://localhost:3001/api/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 📤 Envío de Mensajes

#### Mensaje Simple
```bash
curl -X POST http://localhost:3001/api/send-message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+54911234567",
    "message": "Hola, este es un mensaje de prueba",
    "priority": "normal"
  }'
```

#### Envío Masivo
```bash
curl -X POST http://localhost:3001/api/send-bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "phoneNumber": "+54911234567",
        "message": "Recordatorio de cita para mañana",
        "priority": "high"
      },
      {
        "phoneNumber": "+54987654321",
        "message": "Su documento está listo",
        "priority": "normal"
      }
    ]
  }'
```

#### Programar Mensaje
```bash
curl -X POST http://localhost:3001/api/schedule-reminder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+54911234567",
    "message": "Recordatorio: Cita en 1 hora",
    "delay": 60,
    "priority": "high"
  }'
```

### 🔄 Sincronización con Supabase
```bash
# Sincronizar notificaciones manualmente
curl -X POST http://localhost:3001/api/sync-notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🗂️ Plantillas
```bash
# Obtener plantillas disponibles
curl http://localhost:3001/api/templates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🔧 Control del Bot
```bash
# Reiniciar bot
curl -X POST http://localhost:3001/api/bot/restart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Limpiar sesión
curl -X POST http://localhost:3001/api/bot/clear-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔌 WebSocket en Tiempo Real

### Conexión WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'status_update':
      console.log('Estado actualizado:', data.data);
      break;
    case 'metrics_update':
      console.log('Métricas:', data.data);
      break;
    case 'message_sent':
      console.log('Mensaje enviado:', data.data);
      break;
  }
};
```

---

## 🐳 Despliegue con Docker

### Docker Compose (Recomendado)
```bash
# Copiar archivo de compose
cp docker-compose-ultra.yml docker-compose.yml

# Iniciar servicios completos
docker-compose up -d

# Ver logs
docker-compose logs -f whatsapp-ultra

# Parar servicios
docker-compose down
```

### Docker Simple
```bash
# Construir imagen
cp Dockerfile-ultra Dockerfile
docker build -t whatsapp-ultra:3.0 .

# Ejecutar contenedor
docker run -d \
  --name whatsapp-ultra \
  -p 3001:3001 \
  -p 3002:3002 \
  -v $(pwd)/ultra-sessions:/app/ultra-sessions \
  whatsapp-ultra:3.0
```

---

## 📊 Monitoreo y Métricas

### Grafana Dashboard
- **URL**: http://localhost:3000
- **Usuario**: admin
- **Contraseña**: ultra-admin-2024

### Prometheus Metrics
- **URL**: http://localhost:9090

### Métricas Principales
- **Mensajes por minuto**: Rate de envío de mensajes
- **Tasa de éxito**: Porcentaje de mensajes exitosos
- **Tiempo de respuesta**: Latencia promedio
- **Cola de mensajes**: Mensajes pendientes
- **Uso de CPU/Memoria**: Recursos del sistema
- **Estado de conexión**: WhatsApp conectado/desconectado

---

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# Configuración básica
export NODE_ENV=production
export PORT=3001
export JWT_SECRET=ultra-secure-jwt-secret-2024

# Configuración de clustering
export CLUSTERING_ENABLED=true
export WORKERS=4

# Configuración de Supabase
export SUPABASE_URL=https://scikpgzpgzevkgwwobrf.supabase.co
export SUPABASE_KEY=tu-clave-supabase

# Configuración de WhatsApp
export WHATSAPP_HEADLESS=true
export WHATSAPP_SESSION_NAME=ultra-bot-primary
```

### Archivo de Configuración
```json
{
  "server": {
    "port": 3001,
    "websocketPort": 3002,
    "environment": "production"
  },
  "whatsapp": {
    "sessionName": "ultra-bot-primary",
    "headless": true,
    "reconnectInterval": 30000,
    "maxReconnectAttempts": 10
  },
  "security": {
    "jwtSecret": "ultra-secure-jwt-secret-2024",
    "rateLimitWindow": 900000,
    "rateLimitMax": 100
  },
  "features": {
    "clustering": true,
    "autoBackup": true,
    "healthChecks": true,
    "metrics": true,
    "aiResponses": true
  }
}
```

---

## 🔗 Integración con tu Sistema

### Desde tu Aplicación React/Next.js
```typescript
// utils/whatsappAPI.ts
const WHATSAPP_API_URL = 'http://localhost:3001/api';
const JWT_TOKEN = 'tu-jwt-token';

export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  const response = await fetch(`${WHATSAPP_API_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phoneNumber, message })
  });
  
  return response.json();
};

export const getWhatsAppStatus = async () => {
  const response = await fetch(`${WHATSAPP_API_URL}/status`);
  return response.json();
};
```

### Desde Supabase Edge Function
```typescript
// supabase/functions/send-whatsapp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { phoneNumber, message } = await req.json();
  
  const response = await fetch('http://localhost:3001/api/send-message', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer tu-jwt-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phoneNumber, message })
  });
  
  return new Response(JSON.stringify(await response.json()), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 🛠️ Solución de Problemas

### Problemas Comunes

#### WhatsApp no se conecta
```bash
# Verificar estado
./monitor-ultra.sh whatsapp

# Limpiar sesión y reiniciar
curl -X POST http://localhost:3001/api/bot/clear-session \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reiniciar bot
curl -X POST http://localhost:3001/api/bot/restart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Error de autenticación
```bash
# Verificar token JWT
echo "YOUR_JWT_TOKEN" | base64 -d

# Obtener nuevo token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ultra-secure-2024"}'
```

#### Problemas de rendimiento
```bash
# Verificar métricas
./monitor-ultra.sh metrics

# Ver logs del sistema
tail -f logs/ultra-server.log

# Verificar recursos
htop
docker stats  # Si usas Docker
```

### Logs y Debugging
```bash
# Logs en tiempo real
tail -f logs/ultra-server.log

# Logs de errores
grep ERROR logs/ultra-server.log

# Logs de conexión WhatsApp
grep "WhatsApp" logs/ultra-server.log

# Logs de mensajes
grep "Mensaje" logs/ultra-server.log
```

---

## 📈 Optimización y Performance

### Configuración para Alto Volumen
```javascript
// Configuración optimizada para >1000 mensajes/día
const CONFIG = {
  RATE_LIMIT_MAX: 200,  // Incrementar límite
  RECONNECT_INTERVAL: 15000,  // Reconectar más rápido
  MESSAGE_RETRY_ATTEMPTS: 5,  // Más reintentos
  CLUSTERING_ENABLED: true,  // Habilitar clustering
  WORKERS: 4  // Múltiples workers
};
```

### Monitoreo Continuo
```bash
# Cron job para monitoreo automático
# Agregar a crontab -e:
*/5 * * * * /path/to/monitor-ultra.sh health >> /var/log/whatsapp-monitor.log
```

### Backup Automático
```bash
# Script de backup diario
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf backups/ultra-sessions-$DATE.tar.gz ultra-sessions/
find backups/ -name "*.tar.gz" -mtime +7 -delete
```

---

## 🔐 Seguridad

### Configuración de Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 3001/tcp  # API
sudo ufw allow 3002/tcp  # WebSocket
sudo ufw deny from any to any port 3001 proto tcp  # Solo localhost en producción
```

### SSL/TLS (Producción)
```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name tu-dominio.com;
    
    ssl_certificate /etc/ssl/certs/tu-certificado.crt;
    ssl_certificate_key /etc/ssl/private/tu-clave.key;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📞 Soporte y Contribución

### Reportar Problemas
- **GitHub Issues**: [Link a tu repositorio]
- **Email**: soporte@tu-dominio.com
- **Documentación**: [Link a documentación completa]

### Contribuir
1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

## 🎉 ¡Listo para Usar!

Tu WhatsApp Ultra Server v3.0 está configurado y listo para manejar miles de mensajes diarios con máxima confiabilidad, seguridad y performance.

### Próximos Pasos:
1. ✅ Escanear código QR para conectar WhatsApp
2. ✅ Configurar tokens JWT para tu aplicación
3. ✅ Integrar con tu sistema Supabase existente
4. ✅ Configurar monitoreo y alertas
5. ✅ Realizar pruebas de carga y optimización

**¡Disfruta de tu sistema ultra-optimizado! 🚀**
