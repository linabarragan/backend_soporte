import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'

import { middleware } from '#start/kernel'
import UsuariosController from '#controllers/usuarios_controller'
import AuthController from '#controllers/auth_controller'
import TicketsController from '#controllers/tickets_controller'

import EstadosController from '#controllers/estados_ticketsController'
import PrioridadesController from '#controllers/Prioridades_Controller'
import CategoriasController from '#controllers/Categorias_Controller'
import ServiciosController from '#controllers/Servicios_Controller '
import ProyectosController from '#controllers/proyectos_controller'
import RolesPermisosController from '#controllers/RolesPermisosController'

// --- NUEVAS IMPORTACIONES PARA LOS CONTROLADORES CRUD DE MAESTROS ---
import RolesController from '#controllers/RolesController'
import PermisosController from '#controllers/PermisosController'
import ItemsController from '#controllers/ItemsController'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Rutas de autenticación y usuarios
router.post('/login', [AuthController, 'login'])
router.get('/usuarios', [UsuariosController, 'index'])
router.post('/usuarios', [UsuariosController, 'store'])
router.put('/usuarios/:id', [UsuariosController, 'update'])
router.delete('/usuarios/:id', [UsuariosController, 'destroy'])

router
  .get('/dashboard', [() => import('#controllers/dashboard_controller'), 'index'])
  .middleware([middleware.auth({ guards: ['api'] })])

router.post('/user', '#controllers/login_controller.createUser')

// Grupo de rutas para tickets y otras entidades, con prefijo '/api'
router.group(() => {
  router
    .resource('tickets', TicketsController)
    .only(['index', 'show', 'store', 'update', 'destroy'])

  router.get('estados', [EstadosController, 'index'])
  router.get('prioridades', [PrioridadesController, 'index'])
  router.get('categorias', [CategoriasController, 'index'])
  router.get('servicios', [ServiciosController, 'index'])
  router.get('usuarios_asignables', [UsuariosController, 'index'])
}).prefix('/api')

router.get('/test-password', async () => {
  const password = '1'
  const hashed =
    '$scrypt$n=16384,r=8,p=1$KCOc6mHQZHdIAvH4Z5Fh0A$MA72/3CwHAzLvsoBFb/X03/85V+DjeRT0S65UcLg+tKizrNEgeViEALBbsnOh/teGTIzXv88lNFuPqRZfI1KkA'

  const result = await hash.verify(hashed, password)

  return { result }
})

// Grupo de rutas para empresas
router
  .group(() => {
    router.get('/', '#controllers/empresas_controller.index')
    router.post('/', '#controllers/empresas_controller.store')
    router.put('/:id', '#controllers/empresas_controller.update')
    router.delete('/:id', '#controllers/empresas_controller.destroy')
  })
  .prefix('/api/empresas')

// Grupo de rutas para proyectos (¡Cambiado para usar ProyectosController directamente!)
router
  .group(() => {
    router.get('/', [ProyectosController, 'index'])
    router.post('/', [ProyectosController, 'store'])
    router.put('/:id', [ProyectosController, 'update'])
    router.delete('/:id', [ProyectosController, 'destroy'])
  })
  .prefix('/api/proyectos')

// --- CRUD COMPLETO PARA ROLES ---
// Prefijo: /api/roles
router
  .group(() => {
    router.get('/', [RolesController, 'index'])
    router.get('/:id', [RolesController, 'show'])
    router.post('/', [RolesController, 'store'])
    router.put('/:id', [RolesController, 'update'])
    router.delete('/:id', [RolesController, 'destroy'])
  })
  .prefix('/api/roles')

// --- CRUD COMPLETO PARA PERMISOS ---
// Prefijo: /api/permisos
router
  .group(() => {
    router.get('/', [PermisosController, 'index'])
    router.get('/:id', [PermisosController, 'show'])
    router.post('/', [PermisosController, 'store'])
    router.put('/:id', [PermisosController, 'update'])
    router.delete('/:id', [PermisosController, 'destroy'])
  })
  .prefix('/api/permisos')

// --- CRUD COMPLETO PARA ÍTEMS ---
// Prefijo: /api/items
router
  .group(() => {
    router.get('/', [ItemsController, 'index'])
    router.get('/:id', [ItemsController, 'show'])
    router.post('/', [ItemsController, 'store'])
    router.put('/:id', [ItemsController, 'update'])
    router.delete('/:id', [ItemsController, 'destroy'])
  })
  .prefix('/api/items')


// --- RUTAS CRÍTICAS PARA RolesPermisosController ---
// Estas rutas están bajo /api/permisos-gestion y son para la vista de asignación de permisos
router.group(() => {
  // Rutas para obtener datos maestros para los selectores/checkboxes en la vista de asignación
  router.get('usuarios', [RolesPermisosController, 'getUsuarios'])
  router.get('roles', [RolesPermisosController, 'getRoles'])
  router.get('permisos', [RolesPermisosController, 'getPermisos'])
  router.get('items', [RolesPermisosController, 'getItems'])

  router.get('asignaciones', [RolesPermisosController, 'getAsignaciones']) // <--- HABILITADA
  router.post('asignaciones', [RolesPermisosController, 'createAsignacion'])
  router.delete('asignaciones/:rolId/:permisoId/:itemId', [RolesPermisosController, 'deleteAsignacion'])
  router.put('asignaciones/:rolId/:permisoId/:itemId', [RolesPermisosController, 'updateAsignacion'])

  router.get('roles/:rolId/asignaciones', [RolesPermisosController, 'getAsignacionesPorRol'])

}).prefix('/api/permisos-gestion')

// --- RUTAS PARA CREAR ROLES, PERMISOS, ÍTEMS DESDE LA MISMA VISTA DE ASIGNACIÓN ---
// Estas rutas POST irán a controladores específicos para la creación de cada entidad.
router.group(() => {
  router.post('roles', [RolesController, 'store'])
  router.post('permisos', [PermisosController, 'store'])
  router.post('items', [ItemsController, 'store'])
}).prefix('/api/crud-maestros')

export default router