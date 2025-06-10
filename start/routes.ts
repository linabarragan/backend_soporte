// start/routes.ts

import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'


// ==============================================================================
// IMPORTACIONES DE CONTROLADORES
// ==============================================================================
import AuthController from '#controllers/auth_controller'
import UsuariosController from '#controllers/usuarios_controller'
import TicketsController from '#controllers/tickets_controller'
import EstadosTicketsController from '#controllers/estados_ticketsController' // Asumiendo archivo: estados_tickets_controller.ts
import PrioridadesController from '#controllers/Prioridades_Controller' // Asumiendo archivo: prioridades_controller.ts
import CategoriasController from '#controllers/Categorias_Controller' // Asumiendo archivo: categorias_controller.ts
import ServiciosController from '#controllers/Servicios_Controller ' // Asumiendo archivo: servicios_controller.ts
import RolesController from '#controllers/roles_controller' // ¡Tu controlador de CRUD de roles! Asumiendo archivo: roles_controller.ts
import PermisosController from '#controllers/PermisosController' // Asumiendo archivo: permisos_controller.ts
import ItemsController from '#controllers/ItemsController' // Asumiendo archivo: items_controller.ts
import RolePermissionItemController from '#controllers/roles_permisos_items_controller'
import EmpresasController from '#controllers/empresas_controller' // Asumiendo que tienes este controlador
import ProyectosController from '#controllers/proyectos_controller' // Asumiendo que tienes este controlador
// ==============================================================================
// RUTAS SIN AUTENTICACIÓN / GLOBALES
// ==============================================================================
router.get('/', async () => {
  return { hello: 'world' }
})

router.post('/login', [AuthController, 'login'])

router.post('/forgot-password', [AuthController, 'forgotPassword'])
router.post('/reset-password', [AuthController, 'resetPassword'])

router.get('/test-password', async () => {
  const password = '1'
  const hashed =
    '$scrypt$n=16384,r=8,p=1$KCOc6mHQZHdIAvH4Z5Fh0A$MA72/3CwHAzLvsoBFb/X03/85V+DjeRT0S65UcLg+tKizrNEgeViEALBbsnOh/teGTIzXv88lNFuPqRZfI1KkA'
  const result = await hash.verify(hashed, password)
  return { result }
})

// ==============================================================================
// CRUD PARA ROLES (SIN MIDDLEWARE DE AUTENTICACIÓN)
// ==============================================================================
router
  .group(() => {
    router.get('/', [RolesController, 'index'])
    router.get('/:id', [RolesController, 'show'])
    router.post('/', [RolesController, 'store'])
    router.put('/:id', [RolesController, 'update'])
    router.patch('/:id', [RolesController, 'update']) // Añadido PATCH para flexibilidad
    router.delete('/:id', [RolesController, 'destroy'])
    // ¡NUEVA RUTA! Para eliminar un rol de forma PERMANENTE
    router.delete('/force/:id', [RolesController, 'forceDestroy'])
  })
  .prefix('/api/roles') // Rutas: /api/roles, /api/roles/:id, etc.

// ==============================================================================
// GRUPO GLOBAL PARA OTRAS RUTAS DE API (Sin middleware de autenticación global)
// ==============================================================================
router
  .group(() => {
    // Dashboard (protegido por middleware)
    router
      .get('/dashboard', [() => import('#controllers/dashboard_controller'), 'index'])
      

    router
      .group(() => {
        router.get('/', [UsuariosController, 'index'])
        router.post('/', [UsuariosController, 'store'])
        router.put('/:id', [UsuariosController, 'update'])
        router.delete('/:id', [UsuariosController, 'destroy'])
        router.get('/asignables', [UsuariosController, 'index']) // Si tiene una lógica diferente, método diferente
      })
      .prefix('/usuarios') // -> /api/usuarios
    // Rutas para Tickets (Resource)

    router
      .group(() => {
        router.get('/', [TicketsController, 'index'])
        router.get('/:id', [TicketsController, 'show'])
        router.post('/', [TicketsController, 'store'])
        router.patch('/:id', [TicketsController, 'update'])
        router.delete('/:id', [TicketsController, 'destroy'])
      })
      .prefix('/tickets') // -> /api/tickets
    // Rutas para Entidades Maestras (Lectura - si necesitan CRUD, moverlas a sus propios grupos)

    router.get('/estados', [EstadosTicketsController, 'index']) // -> /api/estados
    router.get('/prioridades', [PrioridadesController, 'index']) // -> /api/prioridades
    router.get('/categorias', [CategoriasController, 'index']) // -> /api/categorias
    router.get('/servicios', [ServiciosController, 'index']) // -> /api/servicios
    // CRUD para Permisos
    router
      .group(() => {
        router.get('/', [PermisosController, 'index'])
        router.get('/:id', [PermisosController, 'show'])
        router.post('/', [PermisosController, 'store'])
        router.put('/:id', [PermisosController, 'update'])
        router.patch('/:id', [PermisosController, 'update'])
        router.delete('/:id', [PermisosController, 'destroy'])
      })
      .prefix('/permisos') // -> /api/permisos
    // CRUD para Ítems

    router
      .group(() => {
        router.get('/', [ItemsController, 'index'])
        router.get('/:id', [ItemsController, 'show'])
        router.post('/', [ItemsController, 'store'])
        router.put('/:id', [ItemsController, 'update'])
        router.patch('/:id', [ItemsController, 'update'])
        router.delete('/:id', [ItemsController, 'destroy'])
      })
      .prefix('/items') // -> /api/items
    // CRUD para Empresas

    router
      .group(() => {
        router.get('/', [EmpresasController, 'index'])
        router.post('/', [EmpresasController, 'store'])
        router.put('/:id', [EmpresasController, 'update'])
        router.patch('/:id', [EmpresasController, 'update'])
        router.delete('/:id', [EmpresasController, 'destroy'])
      })
      .prefix('/empresas') // -> /api/empresas
    // CRUD para Proyectos

    router
      .group(() => {
        router.get('/', [ProyectosController, 'index'])
        router.post('/', [ProyectosController, 'store'])
        router.put('/:id', [ProyectosController, 'update'])
        router.patch('/:id', [ProyectosController, 'update'])
        router.delete('/:id', [ProyectosController, 'destroy'])
      })
      .prefix('/proyectos') // -> /api/proyectos
    // Rutas para Asignaciones de Roles, Permisos e Items (tabla pivote)

    router
      .group(() => {
        router.get('/', [RolePermissionItemController, 'index'])
        router.post('/', [RolePermissionItemController, 'store'])
        router.put('/actualizar-por-rol-item', [RolePermissionItemController, 'updateByRolItem'])
        router.delete('rol/:rolId/item/:itemId', [
          RolePermissionItemController,
          'eliminarPorRolItem',
        ])
        router.delete('/:id', [RolePermissionItemController, 'destroy'])
      })
      .prefix('/asignaciones') // -> /api/asignaciones
  })
  .prefix('/api') // ¡Este grupo principal para /api, sin middleware aquí si quieres todas las rutas internas abiertas!
// .middleware([middleware.auth({ guards: ['api'] })]) // COMENTAR O ELIMINAR si NO QUIERES middleware para todo el grupo /api

 