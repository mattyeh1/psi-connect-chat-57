
#!/bin/bash

# 🚀 Script de Configuración Ultra-Optimizada
# WhatsApp Server v3.0 Enterprise Edition

set -e

echo "🚀 Configurando WhatsApp Ultra Server v3.0..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Verificar Node.js
log "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado. Instala Node.js 18+ primero."
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
fi
log "Node.js $(node -v) ✅"

# Verificar npm
log "Verificando npm..."
if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
fi
log "npm $(npm -v) ✅"

# Instalar dependencias
log "Instalando dependencias..."
if [ -f "package-ultra.json" ]; then
    cp package-ultra.json package.json
    npm install
    log "Dependencias instaladas ✅"
else
    error "package-ultra.json no encontrado"
fi

# Crear directorios necesarios
log "Creando directorios..."
mkdir -p ultra-sessions
mkdir -p logs
mkdir -p backups
mkdir -p config
log "Directorios creados ✅"

# Configurar permisos
log "Configurando permisos..."
chmod +x whatsapp-server-v3-ultra.js
chmod 755 ultra-sessions logs backups config
log "Permisos configurados ✅"

# Crear archivo de configuración si no existe
CONFIG_FILE="config/ultra-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    log "Creando archivo de configuración..."
    cat > "$CONFIG_FILE" << EOF
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
  "supabase": {
    "url": "https://scikpgzpgzevkgwwobrf.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWtwZ3pwZ3pldmtnd3dvYnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTQwOTEsImV4cCI6MjA2MzY5MDA5MX0._ToVfRlR4cuZ_xhZozT-zEHoc43V8iLDWp-wu_Ty_Io"
  },
  "features": {
    "clustering": true,
    "autoBackup": true,
    "healthChecks": true,
    "metrics": true,
    "aiResponses": true
  }
}
EOF
    log "Archivo de configuración creado ✅"
fi

# Crear script de inicio
STARTUP_SCRIPT="start-ultra.sh"
log "Creando script de inicio..."
cat > "$STARTUP_SCRIPT" << 'EOF'
#!/bin/bash

# Script de inicio para WhatsApp Ultra Server
echo "🚀 Iniciando WhatsApp Ultra Server v3.0..."

# Verificar que existe el archivo principal
if [ ! -f "whatsapp-server-v3-ultra.js" ]; then
    echo "❌ Error: whatsapp-server-v3-ultra.js no encontrado"
    exit 1
fi

# Configurar variables de entorno
export NODE_ENV=production
export PORT=3001
export JWT_SECRET=ultra-secure-jwt-secret-2024

# Función para manejo de señales
cleanup() {
    echo "🛑 Cerrando servidor..."
    kill $PID 2>/dev/null
    wait $PID 2>/dev/null
    echo "✅ Servidor cerrado"
    exit 0
}

# Configurar trap para señales
trap cleanup SIGINT SIGTERM

# Iniciar servidor
echo "📡 Iniciando en puerto 3001..."
node whatsapp-server-v3-ultra.js &
PID=$!

# Esperar a que termine
wait $PID
EOF

chmod +x "$STARTUP_SCRIPT"
log "Script de inicio creado ✅"

# Crear script de monitoreo
MONITOR_SCRIPT="monitor-ultra.sh"
log "Creando script de monitoreo..."
cat > "$MONITOR_SCRIPT" << 'EOF'
#!/bin/bash

# Script de monitoreo para WhatsApp Ultra Server
API_URL="http://localhost:3001"

check_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    if [ "$response" = "200" ]; then
        echo "✅ Servidor saludable"
        return 0
    else
        echo "❌ Servidor no responde (HTTP $response)"
        return 1
    fi
}

check_whatsapp() {
    local status=$(curl -s "$API_URL/api/status" | grep -o '"connected":[^,]*' | cut -d':' -f2)
    if [ "$status" = "true" ]; then
        echo "✅ WhatsApp conectado"
        return 0
    else
        echo "❌ WhatsApp desconectado"
        return 1
    fi
}

show_metrics() {
    echo "📊 Métricas del sistema:"
    curl -s "$API_URL/api/metrics" | jq '.' 2>/dev/null || echo "No se pudieron obtener métricas"
}

case "$1" in
    health)
        check_health
        ;;
    whatsapp)
        check_whatsapp
        ;;
    metrics)
        show_metrics
        ;;
    all)
        check_health
        check_whatsapp
        show_metrics
        ;;
    *)
        echo "Uso: $0 {health|whatsapp|metrics|all}"
        exit 1
        ;;
esac
EOF

chmod +x "$MONITOR_SCRIPT"
log "Script de monitoreo creado ✅"

# Crear systemd service (opcional)
if command -v systemctl &> /dev/null; then
    log "Creando servicio systemd..."
    CURRENT_DIR=$(pwd)
    CURRENT_USER=$(whoami)
    
    cat > whatsapp-ultra.service << EOF
[Unit]
Description=WhatsApp Ultra Server v3.0
After=network.target
Wants=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$CURRENT_DIR/start-ultra.sh
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF
    
    echo "Para instalar el servicio systemd ejecuta:"
    echo "sudo cp whatsapp-ultra.service /etc/systemd/system/"
    echo "sudo systemctl enable whatsapp-ultra"
    echo "sudo systemctl start whatsapp-ultra"
fi

# Verificar instalación
log "Verificando instalación..."
if [ -f "whatsapp-server-v3-ultra.js" ] && [ -f "package.json" ] && [ -d "node_modules" ]; then
    log "✅ Instalación completada exitosamente!"
    echo ""
    echo -e "${BLUE}🚀 WhatsApp Ultra Server v3.0 está listo!${NC}"
    echo ""
    echo "📋 Comandos disponibles:"
    echo "  ./start-ultra.sh          - Iniciar servidor"
    echo "  ./monitor-ultra.sh all    - Verificar estado completo"
    echo "  ./monitor-ultra.sh health - Verificar salud del servidor"
    echo "  node whatsapp-server-v3-ultra.js - Inicio directo"
    echo ""
    echo "🌐 URLs importantes:"
    echo "  http://localhost:3001/health    - Health check"
    echo "  http://localhost:3001/api/status - Estado WhatsApp"
    echo "  ws://localhost:3002             - WebSocket"
    echo ""
    echo "📚 Documentación de APIs:"
    echo "  POST /api/auth/login        - Autenticación"
    echo "  POST /api/send-message      - Enviar mensaje"
    echo "  POST /api/send-bulk         - Envío masivo"
    echo "  GET  /api/metrics           - Métricas del sistema"
    echo ""
    echo -e "${GREEN}¡Todo listo para usar! 🎉${NC}"
else
    error "La instalación no se completó correctamente"
fi
