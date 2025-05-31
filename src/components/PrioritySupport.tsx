
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, CheckCircle, AlertCircle, Phone, Mail, Zap } from 'lucide-react';
import { PlanGate } from './PlanGate';

const supportTickets = [
  {
    id: 'SP-001',
    title: 'Problema con sincronización de calendario',
    status: 'resolved',
    priority: 'high',
    createdAt: '2024-01-15',
    responseTime: '15 min'
  },
  {
    id: 'SP-002', 
    title: 'Consulta sobre reportes avanzados',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-01-20',
    responseTime: '8 min'
  }
];

export const PrioritySupport = () => {
  return (
    <PlanGate capability="priority_support">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Soporte Prioritario</h2>
            <p className="text-slate-600">Asistencia exclusiva para usuarios Pro</p>
          </div>
          <Badge className="ml-auto bg-purple-100 text-purple-700">
            <Clock className="w-3 h-3 mr-1" />
            Respuesta en 15 min
          </Badge>
        </div>

        {/* Contacto directo */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              Contacto Directo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="bg-purple-500 hover:bg-purple-600 justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Chat Prioritario</div>
                    <div className="text-xs opacity-90">Respuesta inmediata</div>
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4 border-purple-200">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Llamada Directa</div>
                    <div className="text-xs text-slate-600">+54 11 4567-8900</div>
                  </div>
                </div>
              </Button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-700">Beneficios Pro</span>
              </div>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>• Respuesta garantizada en 15 minutos</li>
                <li>• Acceso a especialistas técnicos</li>
                <li>• Soporte por teléfono y video llamada</li>
                <li>• Atención personalizada 24/7</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Crear nuevo ticket */}
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Consulta
                </label>
                <select className="w-full p-2 border border-slate-300 rounded-md">
                  <option value="technical">Problema Técnico</option>
                  <option value="feature">Nueva Funcionalidad</option>
                  <option value="billing">Facturación</option>
                  <option value="general">Consulta General</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prioridad
                </label>
                <select className="w-full p-2 border border-slate-300 rounded-md">
                  <option value="high">Alta - Problema crítico</option>
                  <option value="medium">Media - Funcionalidad afectada</option>
                  <option value="low">Baja - Consulta general</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Asunto
              </label>
              <Input placeholder="Describe brevemente el problema o consulta" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción Detallada
              </label>
              <Textarea 
                placeholder="Explica en detalle tu consulta o problema. Incluye pasos para reproducir el error si aplica."
                rows={4}
              />
            </div>

            <Button className="w-full bg-purple-500 hover:bg-purple-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar Ticket Prioritario
            </Button>
          </CardContent>
        </Card>

        {/* Historial de tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ticket.status === 'resolved' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {ticket.status === 'resolved' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{ticket.title}</div>
                      <div className="text-sm text-slate-600">
                        Ticket {ticket.id} • {ticket.createdAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {ticket.responseTime}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};
