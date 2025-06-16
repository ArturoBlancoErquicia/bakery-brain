
"use client";

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, Download, CheckCircle, AlertCircle, TableIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "Debes seleccionar un archivo.")
    .refine((files) => files?.[0]?.type === "text/csv", "El archivo debe ser de tipo CSV.")
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, "El archivo no debe exceder los 5MB."),
});

type DataUploadFormValues = z.infer<typeof formSchema>;

const EXPECTED_HEADERS = [
  "transaction_id", "timestamp", "store_id", "product_id", 
  "quantity_sold", "price_unit", "total_amount", "promotion_applied_id"
];

export default function DataUploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const { toast } = useToast();

  const form = useForm<DataUploadFormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleDownloadTemplate = () => {
    const csvContent = EXPECTED_HEADERS.join(",") + 
      "\n" + 
      "T001,2023-01-15T10:30:00Z,S001,P001,2,3.50,7.00,PROMO01" +
      "\n" +
      "T002,2023-01-15T10:32:00Z,S001,P002,1,2.75,2.75," +
      "\n" +
      "T003,2023-01-15T10:35:00Z,S002,P001,3,3.50,10.50,";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "plantilla_ventas_historicas.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const processFile = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) {
          setStatusMessage("Error al leer el archivo.");
          setUploadStatus('error');
          setPreviewData(null);
          resolve(false);
          return;
        }

        const lines = text.split(/\r\n|\n/).map(line => line.trim()).filter(line => line); // Handles both CRLF and LF
        if (lines.length < 2) { 
          setStatusMessage("El archivo CSV está vacío o no contiene suficientes datos (cabecera + al menos una fila).");
          setUploadStatus('error');
          setPreviewData(null);
          resolve(false);
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const missingHeaders = EXPECTED_HEADERS.filter(eh => !headers.includes(eh));
        
        if (missingHeaders.length > 0) {
          setStatusMessage(`El archivo CSV no contiene las siguientes columnas requeridas: ${missingHeaders.join(", ")}.`);
          setUploadStatus('error');
          setPreviewData(null);
          resolve(false);
          return;
        }

        const dataRows = lines.slice(1, Math.min(6, lines.length)).map(line => line.split(',').map(cell => cell.trim()));
        setPreviewData([headers, ...dataRows.slice(0,5)]); 
        
        setTimeout(() => {
          setStatusMessage("Archivo procesado y validado exitosamente (simulación). Los datos estarían listos para ser incorporados y podrían usarse para reentrenar modelos.");
          setUploadStatus('success');
          resolve(true);
        }, 1500);
      };
      reader.onerror = () => {
        setStatusMessage("Error al leer el archivo.");
        setUploadStatus('error');
        setPreviewData(null);
        resolve(false);
      };
      reader.readAsText(file);
    });
  }, []);


  async function onSubmit(values: DataUploadFormValues) {
    setIsLoading(true);
    setUploadStatus('idle');
    setStatusMessage(null);
    setPreviewData(null);

    const file = values.file[0];

    try {
      const success = await processFile(file);
      if (success) {
         toast({
          title: "Carga Exitosa (Simulada)",
          description: "El archivo ha sido validado. En un sistema real, ahora se procesaría en el backend.",
        });
      } else {
         toast({
          variant: "destructive",
          title: "Error en la Carga",
          description: statusMessage || "No se pudo procesar el archivo. Revisa el formato y el contenido.",
        });
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setStatusMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado durante la subida.");
      setUploadStatus('error');
      toast({
        variant: "destructive",
        title: "Error de Subida",
        description: statusMessage || "Ocurrió un error desconocido.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button onClick={handleDownloadTemplate} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Descargar Plantilla CSV
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          La plantilla incluye las columnas requeridas: {EXPECTED_HEADERS.join(", ")}.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Archivo CSV</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormDescription>
                  Selecciona el archivo CSV con los datos históricos de ventas. Tamaño máximo: 5MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Subir y Validar Archivo
          </Button>
        </form>
      </Form>

      {isLoading && (
        <div className="mt-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 font-body">Procesando archivo...</p>
        </div>
      )}

      {uploadStatus !== 'idle' && statusMessage && (
        <div className={`mt-6 p-4 rounded-md ${uploadStatus === 'success' ? 'bg-green-100 dark:bg-green-900 border-green-500' : 'bg-red-100 dark:bg-red-900 border-red-500'} border`}>
          <div className="flex items-center">
            {uploadStatus === 'success' ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" /> : <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />}
            <p className={`text-sm font-medium ${uploadStatus === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {statusMessage}
            </p>
          </div>
        </div>
      )}

      {previewData && uploadStatus === 'success' && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold font-headline mb-2 flex items-center">
            <TableIcon className="mr-2 h-5 w-5" />
            Vista Previa de Datos (Primeras Filas)
          </h3>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {previewData[0].map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
