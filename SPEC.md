# 🚀 Sistema de Gestión de Organizaciones Multi-Tenant - Plan de Implementación

## 📋 Resumen General
Implementación de un sistema SUPERADMIN para crear y gestionar organizaciones multi-tenant con marca personalizada, restricciones de acceso y autenticación basada en slug.

---

## ✅ Fase 1: Actualización del Schema de Base de Datos

### 1.1 Actualizar Modelo Organization
- [x] Agregar campo `logoUrl` (String?, URL de S3)
- [x] Agregar campo `slug` (String, @unique)
- [x] Agregar campo `allowedPages` (String[], array de categorías de menú permitidas)
- [x] Crear modelo `OrganizationFile` para gestionar archivos de organización
- [x] Ejecutar `yarn db:push` para actualizar la base de datos

### 1.2 Actualizar Configuración de NextAuth
- [x] Agregar campo `role` al tipo de sesión
- [x] Agregar `role` al callback del token JWT
- [x] Obtener el role del usuario en el callback de sesión

---

## ✅ Fase 2: Backend - Router tRPC de Organization

### 2.1 Actualizar Mutaciones de Organization
- [x] Actualizar mutación `create` para aceptar:
  - [x] `logoUrl` (opcional)
  - [x] `slug` (requerido, validar unicidad)
  - [x] `allowedPages` (array de strings)
  - [x] `administrators` (array con: firstName, lastName, email, password)
- [x] Implementar validación de unicidad del slug
- [x] Crear primer usuario administrador (isVerified: true, emailVerified: ahora)
- [x] Establecer primer administrador como Organization.ownerId
- [x] Crear registros OrganizationMember (primer admin como OWNER, resto como ADMIN)
- [ ] Actualizar mutación `update` para manejar logo, slug, allowedPages

### 2.2 Agregar Endpoint de Validación de Slug
- [x] Crear query `checkSlugAvailability`
- [x] Retornar booleano si el slug está disponible

---

## ✅ Fase 3: Frontend - Mejora del Modal de Organización

### 3.1 Estructura del Modal (Orden)
1. [x] Sección de Subida de Logo
   - [x] Agregar botón de subida de imagen (placeholder, sin lógica S3 por ahora)
   - [x] Agregar vista previa de imagen
   - [x] Aceptar formatos PNG/JPG

2. [x] Input de Nombre de Empresa
   - [x] Ya existe

3. [x] Input de Slug
   - [x] Agregar campo de input para slug
   - [x] Validación en tiempo real (verificar unicidad) - Pendiente integrar con checkSlugAvailability
   - [ ] Mostrar toast de error si el slug existe
   - [x] Auto-generar sugerencia desde el nombre de empresa

4. [x] Sección de Restricciones (Páginas del Menú)
   - [x] Crear toggles para categorías del menú desde `menu.ts`
   - [x] Categorías: Dashboards, Ecommerce, Projects, CRM, etc.
   - [x] Guardar categorías seleccionadas en un array

5. [x] Sección de Administradores (useFieldArray)
   - [x] Agregar botón "+" para añadir administrador
   - [x] Cada administrador tiene:
     - [x] Input de Nombre
     - [x] Input de Apellido
     - [x] Input de Email
     - [x] Input de Contraseña
   - [x] Botón de eliminar para cada administrador
   - [x] Requerir al menos 1 administrador
   - [x] Primer administrador se crea como OWNER, resto como ADMIN

### 3.2 Validación del Formulario
- [x] Actualizar schema Zod con nuevos campos
- [x] Validar formato de slug (minúsculas, alfanumérico, guiones)
- [x] Validar al menos 1 administrador
- [ ] Validar emails únicos en el array de administradores

---

## ✅ Fase 4: Sistema de Subida de Logo a S3

### 4.1 Backend - Router de Subida de Logo
- [x] Crear mutación `getLogoUploadUrl`
- [x] Generar URL pre-firmada de S3 para `organizations/{orgId}/logo.{ext}`
- [x] Retornar URL pre-firmada al frontend

### 4.2 Frontend - Lógica de Subida de Logo
- [x] Implementar manejador de selección de archivo
- [x] Solicitar URL pre-firmada del backend
- [x] Subir archivo a S3 usando URL pre-firmada
- [x] Actualizar organización con `logoUrl`
- [x] Mostrar progreso de subida

---

## ✅ Fase 5: Autenticación Basada en Slug

### 5.1 Crear Ruta Dinámica de Login
- [x] Crear `/auth/signin-basic/[slug]/page.tsx`
- [x] Obtener organización por slug
- [x] Mostrar logo y nombre de organización en página de login
- [x] Validar que el usuario pertenece a esa organización después del login
- [x] Mostrar error si el usuario no es miembro de la organización
- [x] Mantener `/auth/signin-basic` funcionando normalmente (sin slug)

### 5.2 Actualizar Lógica de SignIn
- [x] Extraer slug de los parámetros de URL
- [x] Consultar organización por slug
- [x] Después del login exitoso, verificar OrganizationMember
- [x] Si no es miembro, mostrar error y prevenir login
- [x] Si es miembro, establecer contexto de organización

---

## ✅ Fase 6: Sistema de Restricciones de Menú

### 6.1 Backend - Lógica de Filtrado de Menú
- [x] Crear función utilitaria para filtrar menú basado en `allowedPages`
- [x] Retornar menú filtrado basado en restricciones de organización

### 6.2 Frontend - Renderizado Dinámico de Menú
- [x] Actualizar `Layout.tsx` para obtener organización del usuario
- [x] Filtrar `menu` basado en `organization.allowedPages`
- [x] Aplicar restricciones a todos los usuarios de la organización (OWNER, ADMIN, MEMBER)
- [x] Mantener menú completo para SUPERADMIN

---

## ✅ Fase 7: Branding de Organización

### 7.1 Branding en Topbar/Sidebar
- [x] Obtener datos de la organización actual (ya implementado en Layout.tsx)
- [x] Mostrar logo de organización en Sidebar (reemplaza logo por defecto)
- [x] Pasar organización como prop desde Layout a Sidebar
- [x] Si el usuario pertenece a múltiples organizaciones, debe logout y entrar por el slug correspondiente

---

## ✅ Fase 8: Pruebas & Validación

### 8.1 Flujo de SUPERADMIN
- [ ] Probar creación de organización con todos los campos
- [ ] Verificar validación de unicidad de slug
- [ ] Verificar que los administradores se crean correctamente
- [ ] Verificar que el primer administrador se convierte en owner
- [ ] Probar subida de logo de organización

### 8.2 Flujo de Usuario de Organización
- [ ] Probar login vía `/auth/signin-basic/{slug}`
- [ ] Verificar que logo y nombre aparecen en página de login
- [ ] Verificar que las restricciones de menú funcionan
- [ ] Verificar que el branding aparece en topbar/sidebar
- [ ] Probar acceso denegado para no-miembros

### 8.3 Casos Extremos
- [ ] Usuario pertenece a múltiples organizaciones
- [ ] Usuario intenta acceder a organización incorrecta vía slug
- [ ] Intento de slug duplicado
- [ ] Array de administradores vacío
- [ ] Subida de imagen inválida

---

## 📝 Notas & Decisiones

### Decisiones Confirmadas:
- ✅ Todos los administradores se crean con `User.role = "USER"`
- ✅ **PRIMER administrador** → `OrganizationMember.role = "OWNER"` y `Organization.ownerId`
- ✅ **RESTO de administradores** → `OrganizationMember.role = "ADMIN"`
- ✅ Todos los administradores auto-verificados (`isVerified: true`, `emailVerified: ahora`)
- ✅ Restricciones aplicadas por CATEGORÍA (no granular por página)
- ✅ SUPERADMIN NO es parte de ninguna organización
- ✅ Solo SUPERADMIN puede eliminar organizaciones

### Modelo de Datos:
```prisma
model Organization {
  id           String   @id @default(cuid()) @map("_id")
  name         String
  description  String?
  logoUrl      String?   // NUEVO
  slug         String    @unique // NUEVO
  allowedPages String[]  @default([]) // NUEVO - ["ecommerce", "projects", "crm"]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  owner        User     @relation("OrganizationOwner", fields: [ownerId], references: [id])
  ownerId      String
  projects     Project[]
  members      OrganizationMember[]
}
```

### Flujo de Creación de Administradores:
```typescript
// SUPERADMIN crea organización con array de administradores
administrators.forEach((admin, index) => {
  // 1. Crear Usuario
  const user = User.create({
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    password: hashedPassword,
    role: "USER",
    isVerified: true,
    emailVerified: new Date()
  })

  // 2. Crear OrganizationMember
  OrganizationMember.create({
    userId: user.id,
    organizationId: org.id,
    role: index === 0 ? "OWNER" : "ADMIN"  // ✅ Solo el primero es OWNER
  })

  // 3. Primer administrador se convierte en ownerId
  if (index === 0) {
    Organization.update({
      where: { id: org.id },
      data: { ownerId: user.id }
    })
  }
})
```

### Jerarquía Resultante:
```
ORGANIZACIÓN "Empresa Perro"
├─ Owner: Juan Pérez (primer admin agregado)
│  └─ Puede: Gestionar todo en la organización
├─ Admin: María García (segundo admin)
│  └─ Puede: Crear proyectos, gestionar usuarios, ver todo
└─ Admin: Pedro López (tercer admin)
   └─ Puede: Crear proyectos, gestionar usuarios, ver todo

Nota: Solo SUPERADMIN puede eliminar la organización
```

---

## 🎯 Progreso Actual: Fase 1 - Planificación del Schema de Base de Datos

**Siguiente Paso:** Actualizar schema de Prisma con nuevos campos
