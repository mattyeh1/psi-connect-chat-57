
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Users, TrendingUp, FileText, Filter } from 'lucide-react';
import { PlanGate } from './PlanGate';

const monthlyData = [
  { month: 'Ene', appointments: 24, patients: 18, revenue: 15000 },
  { month: 'Feb', appointments: 32, patients: 22, revenue: 20000 },
  { month: 'Mar', appointments: 28, patients: 20, revenue: 18000 },
  { month: 'Abr', appointments: 35, patients: 25, revenue: 22000 },
  { month: 'May', appointments: 42, patients: 28, revenue: 26000 },
  { month: 'Jun', appointments: 38, patients: 30, revenue: 24000 }
];

const appointmentTypes = [
  { name: 'Individual', value: 65, color: '#3B82F6' },
  { name: 'Pareja', value: 25, color: '#10B981' },
  { name: 'Familiar', value: 10, color: '#F59E0B' }
];

const patientProgress = [
  { week: 'Sem 1', satisfaction: 7.2, progress: 6.8 },
  { week: 'Sem 2', satisfaction: 7.8, progress: 7.2 },
  { week: 'Sem 3', satisfaction: 8.1, progress: 7.8 },
  { week: 'Sem 4', satisfaction: 8.5, progress: 8.2 }
];

export const AdvancedReports = () => {
  return (
    <PlanGate capability="advanced_reports">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Reportes Avanzados</h2>
            <p className="text-slate-600">Análisis detallado de tu práctica profesional</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Citas este mes</p>
                  <p className="text-2xl font-bold text-blue-600">38</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pacientes activos</p>
                  <p className="text-2xl font-bold text-green-600">30</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Satisfacción</p>
                  <p className="text-2xl font-bold text-purple-600">8.5/10</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700">Excelente</Badge>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+0.3 vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Ingresos</p>
                  <p className="text-2xl font-bold text-orange-600">$24,000</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15% vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencia mensual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-500" />
                Tendencia Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#3B82F6" name="Citas" />
                  <Bar dataKey="patients" fill="#10B981" name="Pacientes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución de tipos de terapia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-500" />
                Tipos de Terapia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {appointmentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Progreso de pacientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-purple-500" />
              Progreso Promedio de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Satisfacción"
                />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  name="Progreso"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Reporte Mensual
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Reporte de Pacientes
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Análisis de Citas
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Proyecciones
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};
