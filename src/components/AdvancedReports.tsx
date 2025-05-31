
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Users, TrendingUp, FileText, Filter, AlertCircle } from 'lucide-react';
import { PlanGate } from './PlanGate';

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

        {/* Estado sin datos */}
        <Card className="border-2 border-dashed border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BarChart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Sin datos suficientes</h3>
            <p className="text-slate-500 text-center max-w-md mb-4">
              Los reportes avanzados se generarán automáticamente cuando tengas más citas y actividad en tu práctica.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <AlertCircle className="w-4 h-4" />
              <span>Se requieren al menos 10 citas para generar reportes</span>
            </div>
          </CardContent>
        </Card>

        {/* Métricas básicas disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Citas este mes</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-slate-500">Comienza agendando citas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pacientes activos</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-slate-500">Invita a tus primeros pacientes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Satisfacción</p>
                  <p className="text-2xl font-bold text-purple-600">-</p>
                </div>
                <Badge className="bg-slate-100 text-slate-700">Sin datos</Badge>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-slate-500">Se calculará automáticamente</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Ingresos</p>
                  <p className="text-2xl font-bold text-orange-600">$0</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-slate-500">Configura tus tarifas</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información sobre funcionalidades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-500" />
                Análisis de Tendencias
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-slate-600 text-center">
                Visualiza el crecimiento de tu práctica mes a mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-500" />
                Distribución por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-slate-600 text-center">
                Analiza qué tipos de terapia son más frecuentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Primeros Pasos para Generar Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-slate-800">Para comenzar necesitas:</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Registrar al menos 10 citas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Completar información de pacientes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Configurar tipos de terapia
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-slate-800">Funcionalidades disponibles:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Análisis mensual</Badge>
                  <Badge variant="outline">Métricas de satisfacción</Badge>
                  <Badge variant="outline">Proyecciones de ingresos</Badge>
                  <Badge variant="outline">Exportación PDF</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};
