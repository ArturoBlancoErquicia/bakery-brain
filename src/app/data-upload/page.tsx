
import React from 'react';
import DataUploadForm from '@/components/data-upload/data-upload-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DataUploadPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Carga de Datos Históricos</h1>
        <p className="text-muted-foreground font-body">
          Sube archivos CSV con datos de ventas históricos para mejorar los pronósticos y análisis.
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Subir Archivo de Datos</CardTitle>
          <CardDescription>
            Selecciona o arrastra un archivo CSV. Asegúrate de que sigue el formato de la plantilla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
