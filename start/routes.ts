// start/routes.ts

import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'


// ==============================================================================
// IMPORTACIONES DE CONTROLADORES
// ==============================================================================
import AuthController from '#controllers/auth_controller'
import UsuariosController from '#controllers/usuarios_controller'
import TicketsController from '#controllers/tickets_controller'
import EstadosTicketsController from '#controllers/estados_ticketsController'
import PrioridadesController from '#controllers/Prioridades_Controller'
import CategoriasController from '#controllers/Categorias_Controller'
import ServiciosController from '#controllers/Servicios_Controller '
import RolesController from '#controllers/roles_controller'
import PermisosController from '#controllers/PermisosController'
import ItemsController from '#controllers/ItemsController'
import RolePermissionItemController from '#controllers/roles_permisos_items_controller'
import EmpresasController from '#controllers/empresas_controller'
import ProyectosController from '#controllers/proyectos_controller'

// ==============================================================================
// RUTAS SIN AUTENTICACIÓN / GLOBALES
// ==============================================================================
router.get('/', async () => {
  return { hello: 'world' }
})

router.post('/login', [AuthController, 'login'])

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
    router.patch('/:id', [RolesController, 'update'])
    router.delete('/:id', [RolesController, 'destroy'])
    router.delete('/force/:id', [RolesController, 'forceDestroy'])
  })
  .prefix('/api/roles')

// ==============================================================================
// GRUPO GLOBAL PARA OTRAS RUTAS DE API (Sin middleware de autenticación global)
// ==============================================================================
router
  .group(() => {
    // ====================================================================
    // Ruta /api/dashboard (SIN MIDDLEWARE DE AUTENTICACIÓN)
    // ====================================================================
    router.get('/dashboard', [() => import('#controllers/dashboard_controller'), 'index'])
    // La línea .middleware() fue eliminada intencionalmente de aquí.

    // ====================================================================
    // Ruta /api/me (SIN MIDDLEWARE DE AUTENTICACIÓN Y SIN LA PALABRA 'auth')
    // Siempre devolverá { user: null } ya que no hay autenticación.
    // ====================================================================
    router.get('/me', async ({ response }) => { // ¡'auth' ha sido eliminado de los parámetros!
      return response.ok({ user: null }) // Siempre devolverá null para el usuario
    })

    // Rutas de Usuarios (CRUD)
    router.group(() => {
      router.get('/', [UsuariosController, 'index'])
      router.post('/', [UsuariosController, 'store'])
      router.put('/:id', [UsuariosController, 'update'])
      router.delete('/:id', [UsuariosController, 'destroy'])
      router.get('/asignables', [UsuariosController, 'index'])
    }).prefix('/usuarios')

    // Rutas para Tickets (Resource)
    router.group(() => {
      router.get('/', [TicketsController, 'index'])
      router.get('/:id', [TicketsController, 'show'])
      router.post('/', [TicketsController, 'store'])
      router.patch('/:id', [TicketsController, 'update'])
      router.delete('/:id', [TicketsController, 'destroy'])
    }).prefix('/tickets')

    // Rutas para Entidades Maestras (Lectura)
    router.get('/estados', [EstadosTicketsController, 'index'])
    router.get('/prioridades', [PrioridadesController, 'index'])
    router.get('/categorias', [CategoriasController, 'index'])
    router.get('/servicios', [ServiciosController, 'index'])

    // CRUD para Permisos
    router.group(() => {
      router.get('/', [PermisosController, 'index'])
      router.get('/:id', [PermisosController, 'show'])
      router.post('/', [PermisosController, 'store'])
      router.put('/:id', [PermisosController, 'update'])
      router.patch('/:id', [PermisosController, 'update'])
      router.delete('/:id', [PermisosController, 'destroy'])
    }).prefix('/permisos')

    // CRUD para Ítems
    router.group(() => {
      router.get('/', [ItemsController, 'index'])
      router.get('/:id', [ItemsController, 'show'])
      router.post('/', [ItemsController, 'store'])
      router.put('/:id', [ItemsController, 'update'])
      router.patch('/:id', [ItemsController, 'update'])
      router.delete('/:id', [ItemsController, 'destroy'])
    }).prefix('/items')

    // CRUD para Empresas
    router.group(() => {
      router.get('/', [EmpresasController, 'index'])
      router.post('/', [EmpresasController, 'store'])
      router.put('/:id', [EmpresasController, 'update'])
      router.patch('/:id', [EmpresasController, 'update'])
      router.delete('/:id', [EmpresasController, 'destroy'])
    }).prefix('/empresas')

    // CRUD para Proyectos
    router.group(() => {
      router.get('/', [ProyectosController, 'index'])
      router.post('/', [ProyectosController, 'store'])
      router.put('/:id', [ProyectosController, 'update'])
      router.patch('/:id', [ProyectosController, 'update'])
      router.delete('/:id', [ProyectosController, 'destroy'])
    }).prefix('/proyectos')

    // Rutas para Asignaciones de Roles, Permisos e Items (tabla pivote)
    router.group(() => {
      router.get('/', [RolePermissionItemController, 'index'])
      router.post('/', [RolePermissionItemController, 'store'])
      router.put('/actualizar-por-rol-item', [RolePermissionItemController, 'updateByRolItem'])
      router.delete('/:id', [RolePermissionItemController, 'destroy'])
    }).prefix('/asignaciones')

  })
  .prefix('/api') // Este es el prefijo para todas las rutas dentro de este grupo.
  // La línea .middleware() para todo el grupo ha sido eliminada intencionalmente.