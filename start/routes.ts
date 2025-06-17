// start/routes.ts

import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'


// Controladores
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
import ComentarioController from '#controllers/comentarios_controller'
import HistorialEstadosTicketsController from '#controllers/historial_estados_tickets_controller'
import NotificacionesController from '#controllers/notificacions_controller'

// ======================== RUTAS GLOBALES ========================
router.get('/', async () => {
  return { hello: 'world' }
})

router.post('/login', [AuthController, 'login'])
router.put('/usuarios/profile-picture-url', [UsuariosController, 'updateProfilePictureUrlNoAuth'])
router.post('/upload', '#controllers/upload_controller.upload')

router.post('/forgot-password', [AuthController, 'forgotPassword'])
router.post('/reset-password', [AuthController, 'resetPassword'])

router.get('/test-password', async () => {
  const password = '1'
  const hashed = '$scrypt$n=16384,r=8,p=1$KCOc6mHQZHdIAvH4Z5Fh0A$MA72/3CwHAzLvsoBFb/X03/85V+DjeRT0S65UcLg+tKizrNEgeViEALBbsnOh/teGTIzXv88lNFuPqRZfI1KkA'
  const result = await hash.verify(hashed, password)
  return { result }
})

router.get('/prueba-conexion-roles', async ({ response }) => {
  console.log('********** Ruta /prueba-conexion-roles **********');
  return response.ok({ message: 'Ruta de prueba de roles OK' });
})
router.get('/prueba-conexion-empresas', async ({ response }) => {
  console.log('********** Ruta /prueba-conexion-empresas **********');
  return response.ok({ message: 'Ruta de prueba de empresas OK' });
})

// ======================== RUTAS API ========================
router
  .group(() => {

    // === RUTA DASHBOARD ===
    router.get('/dashboard', [() => import('#controllers/dashboard_controller'), 'index'])

    // === RUTAS DE USUARIOS ===
    router
      .group(() => {
        router.get('/', [UsuariosController, 'index'])

        // 👇 RUTAS ESTÁTICAS ANTES DE RUTAS DINÁMICAS 👇
        router.get('/obtener-empresas', [UsuariosController, 'getEmpresas'])
        router.get('/obtener-roles', [UsuariosController, 'getRoles'])

        // ✅ NUEVA RUTA PARA OBTENER TÉCNICOS
        router.get('/tecnicos-lista', [UsuariosController, 'getTecnicos'])

        // Rutas CRUD dinámicas
        router.get('/:id', [UsuariosController, 'show'])
        router.post('/', [UsuariosController, 'store'])
        router.put('/:id', [UsuariosController, 'update'])
        router.delete('/:id', [UsuariosController, 'destroy'])
      })
      .prefix('/usuarios')

    // === RUTAS DE TICKETS ===
    router
      .group(() => {
        router.get('/', [TicketsController, 'index'])
        router.post('/:id/comentarios', [ComentarioController, 'store'])
        router.get('/:id/trazabilidad', [HistorialEstadosTicketsController, 'porTicket'])
        router.get('/historial', [TicketsController, 'historial'])
        router.get('/:id/attachment', [TicketsController, 'downloadAttachment'])
        router.get('/:id', [TicketsController, 'show'])
        router.post('/', [TicketsController, 'store'])
        router.patch('/:id', [TicketsController, 'update'])
        router.delete('/:id', [TicketsController, 'destroy'])
      })
      .prefix('/tickets')

    // === RUTAS DE NOTIFICACIONES ===
    router
      .group(() => {
        router.get('/', [NotificacionesController, 'index'])
        router.put('/:id/leida', [NotificacionesController, 'marcarComoLeida'])
      })
      .prefix('/notificaciones')

    // === ENTIDADES MAESTRAS (solo lectura) ===
    router.get('/estados', [EstadosTicketsController, 'index'])
    router.get('/prioridades', [PrioridadesController, 'index'])
    router.get('/categorias', [CategoriasController, 'index'])
    router.get('/servicios', [ServiciosController, 'index'])

    // === RUTAS DE ROLES ===
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
      .prefix('/roles')

    // === RUTAS DE PERMISOS ===
    router
      .group(() => {
        router.get('/', [PermisosController, 'index'])
        router.get('/:id', [PermisosController, 'show'])
        router.post('/', [PermisosController, 'store'])
        router.put('/:id', [PermisosController, 'update'])
        router.patch('/:id', [PermisosController, 'update'])
        router.delete('/:id', [PermisosController, 'destroy'])
      })
      .prefix('/permisos')

    // === RUTAS DE ÍTEMS ===
    router
      .group(() => {
        router.get('/', [ItemsController, 'index'])
        router.get('/:id', [ItemsController, 'show'])
        router.post('/', [ItemsController, 'store'])
        router.put('/:id', [ItemsController, 'update'])
        router.patch('/:id', [ItemsController, 'update'])
        router.delete('/:id', [ItemsController, 'destroy'])
      })
      .prefix('/items')

    // === RUTAS DE EMPRESAS ===
    router
      .group(() => {
        router.get('/', [EmpresasController, 'index'])
        router.post('/', [EmpresasController, 'store'])
        router.put('/:id', [EmpresasController, 'update'])
        router.patch('/:id', [EmpresasController, 'update'])
        router.delete('/:id', [EmpresasController, 'destroy'])
      })
      .prefix('/empresas')

    // === RUTAS DE PROYECTOS ===
    router
      .group(() => {
        router.get('/', [ProyectosController, 'index'])
        router.post('/', [ProyectosController, 'store'])
        router.put('/:id', [ProyectosController, 'update'])
        router.patch('/:id', [ProyectosController, 'update'])
        router.delete('/:id', [ProyectosController, 'destroy'])
      })
      .prefix('/proyectos')

    // === RUTAS DE ASIGNACIONES ===
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
      .prefix('/asignaciones')

  })
  .prefix('/api')

// Si deseas autenticar, puedes descomentar el middleware
//.middleware([middleware.auth({ guards: ['api'] })])