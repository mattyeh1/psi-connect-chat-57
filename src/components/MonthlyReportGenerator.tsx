
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Download } from "lucide-react";
import { useAccountingReports } from "@/hooks/useAccountingReports";
import { toast } from "@/hooks/use-toast";

interface MonthlyReportGeneratorProps {
  psychologistId: string;
}

export const MonthlyReportGenerator = ({ psychologistId }: MonthlyReportGeneratorProps) => {
  const { generateMonthlyReport, reports } = useAccountingReports(psychologistId);
  const [generating, setGenerating] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const handleGenerateReport = async (month: number, year: number) => {
    setGenerating(true);
    try {
      await generateMonthlyReport(month, year);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar el reporte",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleDateString('es-ES', { month: 'long' });
  };

  const canGenerateReport = (month: number, year: number) => {
    // No se puede generar reporte del mes actual o futuro
    if (year > currentYear || (year === currentYear && month >= currentMonth)) {
      return false;
    }
    
    // Verificar si ya existe el reporte
    const existingReport = reports.find(r => r.report_month === month && r.report_year === year);
    return !existingReport;
  };

  const lastThreeMonths = [];
  for (let i = 1; i <= 3; i++) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    lastThreeMonths.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      name: getMonthName(date.getMonth() + 1)
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
          <p className="text-sm text-slate-600">
            Genera reportes mensuales automáticos para presentar a AFIP/ARCA
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lastThreeMonths.map((period) => {
              const existingReport = reports.find(r => 
                r.report_month === period.month && r.report_year === period.year
              );
              
              return (
                <div key={`${period.year}-${period.month}`} className="border rounded-lg p-4">
                  <h3 className="font-medium">{period.name} {period.year}</h3>
                  
                  {existingReport ? (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-2">✓ Reporte generado</p>
                      <p className="text-xs text-slate-600">
                        {existingReport.total_receipts} comprobantes • ${existingReport.total_amount.toLocaleString()}
                      </p>
                      {existingReport.report_file_url && (
                        <Button variant="outline" size="sm" className="mt-2 w-full">
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                      )}
                    </div>
                  ) : canGenerateReport(period.month, period.year) ? (
                    <Button 
                      onClick={() => handleGenerateReport(period.month, period.year)}
                      disabled={generating}
                      className="mt-2 w-full"
                      variant="outline"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {generating ? 'Generando...' : 'Generar Reporte'}
                    </Button>
                  ) : (
                    <p className="text-sm text-slate-500 mt-2">No disponible</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">💡 Automatización</h4>
            <p className="text-sm text-blue-700">
              Los reportes se generan automáticamente el día 5 de cada mes y se envían por email. 
              También recibirás alertas si te acercas a los límites de tu categoría de monotributo.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
