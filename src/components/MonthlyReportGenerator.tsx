
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { useAccountingReports } from "@/hooks/useAccountingReports";
import { toast } from "@/hooks/use-toast";

interface MonthlyReportGeneratorProps {
  psychologistId: string;
}

export const MonthlyReportGenerator = ({ psychologistId }: MonthlyReportGeneratorProps) => {
  const { generateMonthlyReport, reports } = useAccountingReports(psychologistId);
  const [generating, setGenerating] = useState(false);

  // Usar fecha actual real - Junio 2025
  const currentDate = new Date(); // Esto debería ser junio 2025
  const currentMonth = currentDate.getMonth() + 1; // 6 para junio
  const currentYear = currentDate.getFullYear(); // 2025

  console.log('Current date info:', { currentMonth, currentYear, currentDate: currentDate.toISOString() });

  const handleGenerateReport = async (month: number, year: number) => {
    setGenerating(true);
    try {
      console.log(`Generating report for ${month}/${year}`);
      await generateMonthlyReport(month, year);
      toast({
        title: "✅ Reporte generado",
        description: `Reporte de ${getMonthName(month)} ${year} generado exitosamente`
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "❌ Error",
        description: "Error al generar el reporte mensual",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const canGenerateReport = (month: number, year: number) => {
    // Solo permitir generar reportes de meses anteriores completos
    if (year > currentYear) return false;
    if (year === currentYear && month >= currentMonth) return false;
    
    // Verificar si ya existe el reporte
    const existingReport = reports.find(r => r.report_month === month && r.report_year === year);
    return !existingReport;
  };

  const hasExistingReport = (month: number, year: number) => {
    return reports.find(r => r.report_month === month && r.report_year === year);
  };

  // Generar lista de los últimos 6 meses disponibles para reportes
  const availableMonths = [];
  for (let i = 1; i <= 6; i++) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    availableMonths.push({
      month,
      year,
      name: getMonthName(month),
      canGenerate: canGenerateReport(month, year),
      existingReport: hasExistingReport(month, year)
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Generador de Reportes Mensuales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              📅 Mes actual: {getMonthName(currentMonth)} {currentYear}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Los reportes se pueden generar solo para meses anteriores completos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableMonths.map((period) => {
              const report = period.existingReport;
              
              return (
                <div key={`${period.year}-${period.month}`} className="border rounded-lg p-4 bg-white">
                  <h3 className="font-medium text-slate-800">
                    {period.name} {period.year}
                  </h3>
                  
                  {report ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Reporte generado</span>
                      </div>
                      
                      <div className="text-xs text-slate-600 space-y-1">
                        <p><strong>{report.total_receipts}</strong> comprobantes</p>
                        <p><strong>${report.total_amount.toLocaleString()}</strong> total</p>
                        {report.generation_date && (
                          <p>Generado: {new Date(report.generation_date).toLocaleDateString('es-ES')}</p>
                        )}
                      </div>

                      {report.monotax_alert && (
                        <div className={`flex items-center gap-1 text-xs ${
                          report.monotax_alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Alerta monotributo</span>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleGenerateReport(period.month, period.year)}
                          disabled={generating}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Regenerar
                        </Button>
                        
                        {report.report_file_url && (
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : period.canGenerate ? (
                    <div className="mt-3">
                      <Button 
                        onClick={() => handleGenerateReport(period.month, period.year)}
                        disabled={generating}
                        className="w-full"
                        variant="outline"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {generating ? 'Generando...' : 'Generar Reporte'}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-sm text-slate-500">
                        {period.year === currentYear && period.month >= currentMonth 
                          ? 'Mes en curso/futuro' 
                          : 'No disponible'
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-800 mb-2">✨ Sistema Mensual Automatizado</h4>
            <div className="text-sm text-emerald-700 space-y-1">
              <p>• Los comprobantes procesados por OCR se incluyen automáticamente</p>
              <p>• Los reportes muestran datos del mes específico</p>
              <p>• Se incluyen comprobantes aprobados y pendientes de revisión</p>
              <p>• Alertas automáticas de límites de monotributo</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
