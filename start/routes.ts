// start/routes.ts

import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'

import { middleware } from '#start/kernel'
import UsuariosController from '#controllers/usuarios_controller'
import AuthController from '#controllers/auth_controller'
import TicketsController from '#controllers/tickets_controller'

// CORRECCIÓN: Cambiado a snake_case para las importaciones de controladores
import EstadosController from '#controllers/estados_ticketsController'
import PrioridadesController from '#controllers/Prioridades_Controller'
import CategoriasController from '#controllers/Categorias_Controller'
import ServiciosController from '#controllers/Servicios_Controller '
import auth from '@adonisjs/auth/services/main'
import RolePermissionItemController from '#controllers/roles_permisos_items_controller'
import RoleController from '#controllers/role_controller'
import ItemController from '#controllers/item_controller'
import PermisoController from '#controllers/permiso_controller'

// --- NUEVAS IMPORTACIONES PARA LOS CONTROLADORES CRUD DE MAESTROS ---
// CORRECCIÓN: Cambiado a snake_case para las importaciones de controladores
import RolesController from '#controllers/RolesController'
import PermisosController from '#controllers/PermisosController'
import ItemsController from '#controllers/ItemsController'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
// Rutas de autenticación
router.post('/login', [AuthController, 'login'])
router.post('/user', '#controllers/login_controller.createUser') // Asumiendo que es para registro de usuarios

// ==============================================================================
// GRUPO GLOBAL PARA TODAS LAS RUTAS DE API
// ==============================================================================
router
  .group(() => {
    // Rutas de usuarios (CRUD)
    router.get('/usuarios', [UsuariosController, 'index'])
    router.post('/usuarios', [UsuariosController, 'store'])
    router.put('/usuarios/:id', [UsuariosController, 'update'])
    router.delete('/usuarios/:id', [UsuariosController, 'destroy'])
    router.get('/usuarios_asignables', [UsuariosController, 'index']) // Si esta también necesita /api

    // Dashboard (protegido por middleware)
    router
      .get('/dashboard', [() => import('#controllers/dashboard_controller'), 'index'])
      .middleware([middleware.auth({ guards: ['api'] })])

    // Rutas para tickets (Resource)
    router
      .group(() => {
        router.get('/', [TicketsController, 'index']) // GET /api/tickets - Obtener todos los tickets
        router.get('/:id', [TicketsController, 'show']) // GET /api/tickets/:id - Obtener un ticket por ID
        router.post('/', [TicketsController, 'store']) // POST /api/tickets - Crear un nuevo ticket
        router.patch('/:id', [TicketsController, 'update']) // PUT /api/tickets/:id - Actualizar un ticket por ID
        router.delete('/:id', [TicketsController, 'destroy']) // DELETE /api/tickets/:id - Eliminar un ticket por ID
      })
      .prefix('/tickets')

    // Rutas para entidades maestras (solo lectura si no necesitas CRUD completo aquí)
    router.get('estados', [EstadosController, 'index'])
    router.get('prioridades', [PrioridadesController, 'index'])
    router.get('categorias', [CategoriasController, 'index'])
    router.get('servicios', [ServiciosController, 'index'])

    // Grupo de rutas para empresas (CRUD)
    // router
    //   .group(() => {
    //     router.get('/', '#controllers/empresas_controller.index')
    //     router.post('/', '#controllers/empresas_controller.store')
    //     router.put('/:id', '#controllers/empresas_controller.update')
    //     router.delete('/:id', '#controllers/empresas_controller.destroy')
    //   })
    //   .prefix('/empresas') // -> /api/empresas

    // Grupo de rutas para proyectos (CRUD)

    // --- CRUD COMPLETO PARA ROLES ---
    router
      .group(() => {
        router.get('/', [RolesController, 'index'])
        router.get('/:id', [RolesController, 'show'])
        router.post('/', [RolesController, 'store'])
        router.put('/:id', [RolesController, 'update'])
        router.delete('/:id', [RolesController, 'destroy'])
      })
      .prefix('/roles') // -> /api/roles

    // --- CRUD COMPLETO PARA PERMISOS ---
    router
      .group(() => {
        router.get('/', [PermisosController, 'index'])
        router.get('/:id', [PermisosController, 'show'])
        router.post('/', [PermisosController, 'store'])
        router.put('/:id', [PermisosController, 'update'])
        router.delete('/:id', [PermisosController, 'destroy'])
      })
      .prefix('/permisos') // -> /api/permisos

    // --- CRUD COMPLETO PARA ÍTEMS ---
    router
      .group(() => {
        router.get('/', [ItemsController, 'index'])
        router.get('/:id', [ItemsController, 'show'])
        router.post('/', [ItemsController, 'store'])
        router.put('/:id', [ItemsController, 'update'])
        router.delete('/:id', [ItemsController, 'destroy'])
      })
      .prefix('/items') // -> /api/items

    // --- RUTAS PARA CREAR ROLES, PERMISOS, ÍTEMS DESDE LA MISMA VISTA DE ASIGNACIÓN ---
    // Si ya tienes las rutas POST en /api/roles, /api/permisos, /api/items,
    // este grupo es redundante y puede ser eliminado.
    /*
  router.group(() => {
    router.post('roles', [RolesController, 'store'])
    router.post('permisos', [PermisosController, 'store'])
    router.post('items', [ItemsController, 'store'])
  }).prefix('/crud-maestros') // -> /api/crud-maestros
  */
  })
  .prefix('/api') // <--- ¡PREFIJO GLOBAL PARA TODAS LAS RUTAS DE API!

// Ruta de prueba de contraseña (fuera del grupo /api si no es una API endpoint)
router.get('/test-password', async () => {
  const password = '1'
  const hashed =
    '$scrypt$n=16384,r=8,p=1$KCOc6mHQZHdIAvH4Z5Fh0A$MA72/3CwHAzLvsoBFb/X03/85V+DjeRT0S65UcLg+tKizrNEgeViEALBbsnOh/teGTIzXv88lNFuPqRZfI1KkA'

  const result = await hash.verify(hashed, password)

  return { result }
})

router
  .group(() => {
    router.get('/', '#controllers/empresas_controller.index') // Obtener todas las empresas
    router.post('/', '#controllers/empresas_controller.store') // Crear una nueva empresa
    router.put('/:id', '#controllers/empresas_controller.update') // Actualizar empresa por ID
    router.delete('/:id', '#controllers/empresas_controller.destroy')
  })
  .prefix('/api/empresas')

router
  .group(() => {
    router.get('/', '#controllers/proyectos_controller.index') // Obtener todos los proyectos
    router.post('/', '#controllers/proyectos_controller.store') // Crear un nuevo proyecto
    router.put('/:id', '#controllers/proyectos_controller.update') // Actualizar proyecto por ID
    router.delete('/:id', '#controllers/proyectos_controller.destroy')
  })
  .prefix('/api/proyectos')

router.get('/asignaciones', [RolePermissionItemController, 'index'])
router.post('/asignaciones', [RolePermissionItemController, 'store'])
router.put('/asignaciones/actualizar-por-rol-item', [
  RolePermissionItemController,
  'updateByRolItem',
])
router.delete('/asignaciones/:id', [RolePermissionItemController, 'destroy'])

router.get('/roles', [RoleController, 'index'])
router.get('/items', [ItemController, 'index'])
router.get('/permisos', [PermisoController, 'index'])
