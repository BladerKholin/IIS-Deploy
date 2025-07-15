# 📄 Instalación de LibreOffice para Conversión de Documentos

Esta guía te ayudará a instalar y configurar LibreOffice para que funcione correctamente con el backend de la aplicación para la conversión automática de documentos.

## 🎯 Propósito

LibreOffice se utiliza en el backend para:
- Convertir documentos de Word (.docx) a PDF
- Convertir hojas de Excel (.xlsx) a PDF
- Transformar presentaciones (.pptx) a PDF
- Procesar otros formatos de documentos de oficina

---

## 📋 Requisitos del Sistema

- **Sistema Operativo**: Windows 10/11 o Windows Server 2016+
- **RAM**: Mínimo 2GB disponibles
- **Espacio en disco**: ~1GB para la instalación completa
- **Permisos**: Administrador para la instalación

---

## ⬇️ Descarga e Instalación

### Paso 1: Descargar LibreOffice

1. Visitar la página oficial: [https://www.libreoffice.org/download/download/](https://www.libreoffice.org/download/download/)
2. Seleccionar la versión **LTS (Long Term Support)** más reciente
3. Elegir la arquitectura correcta:
   - **x86-64 (64-bit)** - Recomendado para servidores modernos
   - **x86 (32-bit)** - Solo si tienes un sistema de 32 bits

### Paso 2: Ejecutar el Instalador

1. Ejecutar el archivo descargado como **Administrador**
2. Seguir el asistente de instalación:
   - **Tipo de instalación**: Seleccionar "Típica"
   - **Directorio de instalación**: Mantener la ruta predeterminada `C:\Program Files\LibreOffice`
   - **Componentes**: Asegurarse de que estén seleccionados:
     - ✅ LibreOffice Writer
     - ✅ LibreOffice Calc  
     - ✅ LibreOffice Impress
     - ✅ LibreOffice Draw

### Paso 3: Verificar la Instalación

Después de la instalación, verificar que el ejecutable esté en la ruta correcta:

```powershell
# Verificar que existe el ejecutable
Test-Path "C:\Program Files\LibreOffice\program\soffice.exe"
```

Si devuelve `True`, la instalación fue exitosa.

---

## ⚙️ Configuración para el Backend

### Verificar la Ruta en el .env

El archivo `.env` del backend debe contener la ruta correcta al ejecutable:

```properties
LIBRE_OFFICE_EXE=C:\Program Files\LibreOffice\program\soffice.exe
```

### Rutas Alternativas Comunes

Si LibreOffice se instaló en una ubicación diferente, estas son las rutas más comunes:

```properties
# Instalación estándar 64-bit
LIBRE_OFFICE_EXE=C:\Program Files\LibreOffice\program\soffice.exe

# Instalación 32-bit en sistema 64-bit
LIBRE_OFFICE_EXE=C:\Program Files (x86)\LibreOffice\program\soffice.exe

# Instalación personalizada
LIBRE_OFFICE_EXE=D:\LibreOffice\program\soffice.exe
```

---

## 🔧 Configuración para Modo Servidor

### Configuración de Permisos

1. **Permisos de Ejecución**: El usuario que ejecuta el backend (normalmente el usuario del sistema o IIS) debe tener permisos para:
   - Leer la carpeta de LibreOffice
   - Ejecutar `soffice.exe`
   - Escribir en directorios temporales

2. **Configurar Permisos** (si es necesario):

```powershell
# Dar permisos al usuario de IIS
icacls "C:\Program Files\LibreOffice" /grant "IIS_IUSRS:(RX)" /T
```

### Configuración de Variables de Sistema

Para evitar problemas con la interfaz gráfica en un servidor, configurar:

```powershell
# Crear variable de entorno para modo headless
[Environment]::SetEnvironmentVariable("SAL_USE_VCLPLUGIN", "svp", "Machine")
```

---

## 🧪 Pruebas de Funcionamiento

### Prueba Manual desde Línea de Comandos

```powershell
# Crear un archivo de prueba (ejemplo.txt)
"Contenido de prueba" | Out-File -FilePath "C:\temp\ejemplo.txt" -Encoding UTF8

# Convertir a PDF usando LibreOffice
& "C:\Program Files\LibreOffice\program\soffice.exe" --headless --convert-to pdf --outdir "C:\temp" "C:\temp\ejemplo.txt"

# Verificar que se creó el PDF
Test-Path "C:\temp\ejemplo.pdf"
```

### Prueba desde el Backend

1. Iniciar el backend
2. Usar la funcionalidad de conversión de documentos de la aplicación
3. Verificar los logs para confirmar que no hay errores

---

## 🚨 Solución de Problemas

### Error: "soffice.exe no encontrado"

**Solución:**
1. Verificar la ruta en el archivo `.env`
2. Comprobar que LibreOffice esté instalado correctamente
3. Intentar con rutas alternativas

### Error: "Access denied" o permisos

**Solución:**
```powershell
# Verificar permisos del directorio
icacls "C:\Program Files\LibreOffice\program\soffice.exe"

# Agregar permisos si es necesario
icacls "C:\Program Files\LibreOffice\program\soffice.exe" /grant "Everyone:(RX)"
```

### Error: "Cannot convert document"

**Soluciones:**
1. Verificar que el archivo de entrada existe y es accesible
2. Comprobar permisos de escritura en el directorio de salida
3. Intentar conversión manual para descartar problemas del archivo

### LibreOffice no responde o se cuelga

**Soluciones:**
1. Terminar procesos zombie de LibreOffice:
```powershell
Get-Process -Name "soffice*" | Stop-Process -Force
```

2. Configurar timeout en el backend para evitar procesos colgados

### Error en servidor sin interfaz gráfica

**Solución:**
```powershell
# Configurar LibreOffice para modo servidor
[Environment]::SetEnvironmentVariable("SAL_USE_VCLPLUGIN", "svp", "Machine")

# Reiniciar el servicio del backend después de este cambio
```

---

## 🔄 Actualizaciones

### Mantener LibreOffice Actualizado

1. Verificar actualizaciones periódicamente en [libreoffice.org](https://www.libreoffice.org)
2. Descargar e instalar nuevas versiones LTS
3. Verificar que la ruta en `.env` siga siendo correcta después de actualizar

### Compatibilidad de Versiones

- **Recomendado**: Usar siempre versiones LTS para mayor estabilidad
- **Mínimo**: LibreOffice 7.0 o superior
- **Tested**: Esta aplicación fue probada con LibreOffice 7.6 LTS

---

## 📊 Monitoreo

### Logs a Revisar

1. **Logs del Backend**: Verificar errores relacionados con conversión
2. **Event Viewer**: Buscar errores de LibreOffice en el sistema
3. **Archivos Temporales**: Limpiar periódicamente archivos temporales de conversión

### Métricas Importantes

- Tiempo de conversión por documento
- Tasa de éxito de conversiones
- Uso de memoria durante conversiones
- Procesos zombie de LibreOffice

---

## ✅ Checklist de Instalación

- [ ] LibreOffice descargado desde el sitio oficial
- [ ] Instalación completada como Administrador
- [ ] Ejecutable verificado en la ruta esperada
- [ ] Variable `LIBRE_OFFICE_EXE` configurada en `.env`
- [ ] Permisos configurados para el usuario del backend
- [ ] Variables de entorno del sistema configuradas
- [ ] Prueba manual de conversión exitosa
- [ ] Prueba desde la aplicación funcionando
- [ ] Logs del backend sin errores de LibreOffice

---

## 🎯 Resumen de Rutas Importantes

```
Ejecutable principal:
C:\Program Files\LibreOffice\program\soffice.exe

Directorio de instalación:
C:\Program Files\LibreOffice\

Archivos temporales (limpiar periódicamente):
C:\Users\[usuario]\AppData\Local\Temp\
```

¡Con esta configuración, LibreOffice debería funcionar correctamente para la conversión automática de documentos en tu aplicación!
