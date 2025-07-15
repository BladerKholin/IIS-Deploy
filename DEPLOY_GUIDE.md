# 🚀 Guía de Despliegue - Bitacora INFOR en Windows Server con IIS

Esta guía te ayudará a desplegar la aplicación Bitacora INFOR (Next.js + Node.js/Express + MySQL) en un servidor Windows con IIS.

## 📋 Prerrequisitos

- Windows Server 2016 o superior
- Permisos de administrador
- Acceso a internet para descargar dependencias

## 🛠️ Componentes de la Aplicación

- **Frontend**: Next.js (estático) servido por IIS
- **Backend**: Node.js/Express en puerto 5000
- **Base de datos**: MySQL
- **Herramientas**: LibreOffice para conversión de documentos

> **📂 Código fuente**: El código fuente del programa está disponible en el siguiente repositorio: https://github.com/BladerKholin/bitacora-infor

> **⚠️ Frontend Build**: El frontend considera al backend en localhost:5000, si se desea cambiar esto sería necesario volver a compilar el frontend modificando el .env.production respectivo.

---

## 1️⃣ Instalación de Prerrequisitos

### 1.1 Instalar Node.js

1. Descargar Node.js LTS desde [nodejs.org](https://nodejs.org/)
2. Ejecutar el instalador y seguir las instrucciones
3. Verificar la instalación:

```powershell
node --version
npm --version
```

### 1.2 Instalar MySQL Server

1. Descargar MySQL Server desde [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Durante la instalación, configurar:
   - Root password: Elegir una contraseña segura (recordar para el archivo `.env`)
   - Puerto: `3306` (predeterminado)
3. Verificar que el servicio MySQL esté ejecutándose

### 1.3 Instalar IIS y Módulos Necesarios

1. Abrir **Panel de Control** → **Programas** → **Activar o desactivar las características de Windows**
2. Habilitar:
   - **Internet Information Services (IIS)**
   - **IIS Management Console**
   - **World Wide Web Services**

3. Descargar e instalar módulos adicionales:
   - **Application Request Routing (ARR)**: [Descargar ARR](https://www.iis.net/downloads/microsoft/application-request-routing)
   - **URL Rewrite Module**: [Descargar URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)

### 1.4 Instalar PM2 (Opcional pero Recomendado)

```powershell
npm install -g pm2
npm install -g pm2-windows-service
pm2-service-install
```

---

## 2️⃣ Configuración de la Base de Datos

### 2.1 Ejecutar Script de Inicialización

El archivo `sql/schema.sql` contiene todo lo necesario: creación de la base de datos, tablas y datos iniciales.

```powershell
# Ejecutar el script completo
mysql -u root -p < sql/schema.sql
```

### 2.2 Verificar la Instalación

```powershell
# Verificar que la base de datos y tablas se crearon correctamente
mysql -u root -p -e "USE bitacora_infor; SHOW TABLES;"
```

Deberías ver las siguientes tablas:
- `actions`
- `attachments` 
- `calendarEvents`
- `categories`
- `departments`
- `events`
- `receptions`
- `sended`
- `users`

---

## 3️⃣ Instalación de LibreOffice

Consultar el archivo `libreoffice/README.md` para instrucciones detalladas.

**Resumen rápido:**

1. Descargar LibreOffice desde [libreoffice.org](https://www.libreoffice.org/download/download/)
2. Instalar en la ruta predeterminada: `C:\Program Files\LibreOffice`
3. Verificar que el ejecutable esté en: `C:\Program Files\LibreOffice\program\soffice.exe`

---

## 4️⃣ Despliegue del Backend

### 4.1 Instalar Dependencias

```powershell
cd backend
npm install
```

### 4.2 Configurar Variables de Entorno

1. Copiar el archivo de ejemplo y editarlo:

```powershell
Copy-Item .env.example .env
```

2. Editar el archivo `.env` con tus valores específicos:

```properties
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=bitacora_infor

# Puerto del Backend
PORT=5000

# Configuración LDAP/Active Directory
LDAP_HOST=192.168.1.100
LDAP_PORT=389
LDAP_BASE_DNS=ou=TIC,dc=tuempresa,dc=com;ou=OOPP,dc=tuempresa,dc=com
LDAP_BASE_DN=dc=tuempresa,dc=com
LDAP_BIND_DN=cn=ldap-reader,cn=Users,dc=tuempresa,dc=com
LDAP_BIND_PASSWORD=tu_password_ldap
AD_DOMAIN=tuempresa.com
LDAP_ADMIN_GROUPS=TIC-Admins;OOPP-Admins

# URLs de la Aplicación
PUBLIC_API_URL=http://tu-servidor.com:5000
FRONTEND_URL=http://tu-servidor.com

# Seguridad JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu-jwt-secret-muy-seguro-y-aleatorio

# Ruta de LibreOffice
LIBRE_OFFICE_EXE=C:\Program Files\LibreOffice\program\soffice.exe

# Configuración de Email SMTP
SMTP_USER=noreply.bitacorainfor@gmail.com
SMTP_PASSWORD=uxan hszj euju vwtl
REMINDER_DAYS_BEFORE=3
```

**⚠️ Importante**: Reemplazar todos los valores de ejemplo con los datos reales de tu entorno.

**📋 Configuración LDAP/Active Directory Requerida**: 
El backend está configurado para autenticarse contra Active Directory y espera:

1. **Usuario de servicio** para búsquedas LDAP:
   - DN: `cn=ldap-reader,cn=Users,dc=example,dc=com` (configurar en `LDAP_BIND_DN`)
   - Password: configurar en `LDAP_BIND_PASSWORD`

2. **Usuarios** deben estar en unidades organizacionales:
   - `OU=TIC` para departamento TIC
   - `OU=OOPP` para departamento OOPP

3. **Grupos de administradores**:
   - `TIC-Admins` para administradores del departamento TIC
   - `OOPP-Admins` para administradores del departamento OOPP

4. **Atributos esperados** en los usuarios:
   - `sAMAccountName` (nombre de usuario)
   - `memberOf` (grupos del usuario)
   - `distinguishedName` (DN completo)

> **💡 Nota**: El backend determina el departamento del usuario por su DN (si contiene `OU=TIC` o `OU=OOPP`) o por sus grupos (si contienen "TIC" o "OOPP").

### 4.3 Ejecutar el Backend

**Opción A: Ejecutar directamente**

```powershell
node server.js
```

**Opción B: Usar PM2 (Recomendado)**

```powershell
pm2 start server.js --name "bitacora-infor-backend"
pm2 save
pm2 startup
```

### 4.4 Verificar que el Backend Esté Funcionando

```powershell
# Probar endpoint básico
curl http://localhost:5000/api/health
```

---

## 5️⃣ Despliegue del Frontend

### 5.1 Configurar IIS para el Frontend

1. Abrir **IIS Manager**
2. Click derecho en **Sites** → **Add Website**
3. Configurar:
   - **Site name**: `bitacora-infor`
   - **Physical path**: `C:\inetpub\wwwroot\bitacora-infor`
   - **Port**: `80` (o el puerto que prefieras)

4. Crear directorio y copiar archivos del frontend:

```powershell
mkdir C:\inetpub\wwwroot\bitacora-infor
Copy-Item -Path ".\frontend\out\*" -Destination "C:\inetpub\wwwroot\bitacora-infor\" -Recurse
```

### 5.2 Configurar Reescritura de URLs para SPA

1. En **IIS Manager**, seleccionar el sitio `bitacora-infor`
2. Hacer doble click en **URL Rewrite**
3. Click en **Add Rule(s)** → **Blank rule**
4. Configurar:
   - **Name**: `SPA Fallback`
   - **Pattern**: `^(?!api/).*`
   - **Action Type**: `Rewrite`
   - **Rewrite URL**: `/index.html`
   - **Stop processing of subsequent rules**: ✅

---

## 6️⃣ Configurar Proxy Inverso para el Backend

### 6.1 Habilitar Application Request Routing

1. En **IIS Manager**, click en el servidor (nivel raíz)
2. Doble click en **Application Request Routing Cache**
3. Click en **Server Proxy Settings** en el panel derecho
4. Marcar **Enable proxy** y click **Apply**

### 6.2 Crear Regla de Proxy para API

1. Volver al sitio `bitacora-infor`
2. En **URL Rewrite**, click **Add Rule(s)** → **Blank rule**
3. Configurar:
   - **Name**: `API Proxy`
   - **Pattern**: `^api/(.*)`
   - **Action Type**: `Rewrite`
   - **Rewrite URL**: `http://localhost:5000/api/{R:1}`
   - **Stop processing**: ✅

### 6.3 Orden de las Reglas

Asegurarse de que las reglas estén en este orden:
1. **API Proxy** (primero)
2. **SPA Fallback** (segundo)

---

## 7️⃣ Configuración de Firewall

Si está habilitado el Windows Firewall:

```powershell
# Permitir tráfico HTTP
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Permitir tráfico para el backend (si es necesario acceso directo)
New-NetFirewallRule -DisplayName "Backend API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

---

## 8️⃣ Verificaciones Finales

### 8.1 Probar Conexión a la Base de Datos

```powershell
cd backend
node -e "
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'tu_password_mysql',
  database: 'bitacora_infor'
});
connection.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
  } else {
    console.log('✅ Conexión a MySQL exitosa');
  }
  connection.end();
});
"
```

> **Nota**: Reemplaza `tu_password_mysql` con la contraseña real configurada en tu archivo `.env`

### 8.2 Probar el Frontend

1. Abrir navegador en `http://tu-servidor` (o la IP del servidor)
2. Verificar que la aplicación carga correctamente

### 8.3 Probar las APIs

```powershell
# Probar endpoint directo del backend
curl http://localhost:5000/api/health

# Probar endpoint a través del proxy de IIS
curl http://tu-servidor/api/health
```

### 8.4 Probar Autenticación LDAP/AD

```powershell
# Probar conexión LDAP desde el backend
cd backend
node -e "
const ldap = require('ldapjs');
const client = ldap.createClient({
  url: 'ldap://' + process.env.LDAP_HOST + ':' + process.env.LDAP_PORT
});

client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD, (err) => {
  if (err) {
    console.error('❌ Error conectando a LDAP:', err.message);
  } else {
    console.log('✅ Conexión LDAP exitosa');
    console.log('Host:', process.env.LDAP_HOST);
    console.log('Puerto:', process.env.LDAP_PORT);
    console.log('Bind DN:', process.env.LDAP_BIND_DN);
  }
  client.unbind();
  process.exit();
});
"
```

### 8.5 Probar Conversión de LibreOffice

1. Subir un archivo para conversión a través de la aplicación
2. Verificar que se procesa correctamente
3. Comprobar logs del backend para errores

---

## 9️⃣ Configuración de Producción

### 9.1 Variables de Entorno de Producción

Actualizar `.env` con valores de producción:

```properties
# URLs de producción
PUBLIC_API_URL=https://tu-dominio.com
FRONTEND_URL=https://tu-dominio.com

# JWT Secret más seguro (generar uno nuevo)
JWT_SECRET=un-secreto-muy-seguro-y-aleatorio-de-minimo-32-caracteres

# Configuración LDAP/AD de producción
LDAP_HOST=tu-servidor-ad.tuempresa.com
LDAP_BIND_PASSWORD=password-seguro-ldap

# Email de producción (usar la configuración específica del proyecto)
SMTP_USER=noreply.bitacorainfor@gmail.com
SMTP_PASSWORD=uxan hszj euju vwtl
```

### 9.2 Configurar HTTPS (Recomendado)

1. Obtener certificado SSL
2. Configurar binding HTTPS en IIS
3. Actualizar URLs en `.env` para usar `https://`

### 9.3 Configurar Logs

```powershell
# Ver logs de PM2
pm2 logs bitacora-infor-backend

# Configurar rotación de logs
pm2 install pm2-logrotate
```

---

## ✅ Checklist de Despliegue

- [ ] Node.js instalado y funcionando
- [ ] MySQL instalado y base de datos creada
- [ ] LibreOffice instalado
- [ ] IIS configurado con ARR y URL Rewrite
- [ ] Usuario de servicio LDAP configurado y funcionando
- [ ] Usuarios organizados en OUs TIC/OOPP o grupos apropiados
- [ ] Backend ejecutándose en puerto 5000
- [ ] Frontend desplegado en IIS
- [ ] Reglas de proxy configuradas
- [ ] Conexión a base de datos verificada
- [ ] Conexión LDAP/AD verificada
- [ ] APIs accesibles a través de IIS
- [ ] Autenticación de usuarios funcionando
- [ ] Conversión de LibreOffice funcionando
- [ ] Variables de entorno de producción configuradas
