import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'

import { middleware } from '#start/kernel'
import UsuariosController from '#controllers/usuarios_controller'
// import Route from '@ioc:Adonis/Core/Route'
import AuthController from '#controllers/auth_controller'
import TicketsController from '#controllers/tickets_controller' // Ya la tienes aquí

// AGREGAR ESTAS IMPORTACIONES PARA LOS NUEVOS CONTROLADORES DE LISTAS DE REFERENCIA (snake_case)
import EstadosController from '#controllers/estados_ticketsController'
import PrioridadesController from '#controllers/Prioridades_Controller'
import CategoriasController from '#controllers/Categorias_Controller'
import ServiciosController from '#controllers/Servicios_Controller '


// const usuariosController = new UsuariosController()

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.post('/login', [AuthController, 'login'])
router.get('/usuarios', [UsuariosController, 'index'])
router.post('/usuarios', [UsuariosController, 'store'])

router.put('/usuarios/:id', [UsuariosController, 'update'])

router.delete('/usuarios/:id', [UsuariosController, 'destroy'])

router
  .get('/dashboard', [() => import('#controllers/dashboard_controller'), 'index'])
  .middleware([middleware.auth({ guards: ['api'] })])

// router.post('/login', '#controllers/auth_controller.login')

router.post('/user', '#controllers/login_controller.createUser')

// --- TU CÓDIGO ORIGINAL PARA TICKETS (AJUSTADO LIGERAMENTE PARA RESOURCE) ---
router.group(() => {
  // Asegúrate de que los métodos en TicketsController sean 'index', 'show', 'store', 'update', 'destroy'
  router.resource('tickets', TicketsController)
        .only(['index', 'show', 'store', 'update', 'destroy']) // Define explícitamente los métodos
  // router.get('/tickets', '#controllers/TicketsController.list') // Comentada esta línea si usas resource
  // router.post('/tickets', '#controllers/TicketsController.store') // Comentada esta línea si usas resource

  // AGREGAR ESTAS NUEVAS RUTAS PARA LAS LISTAS DE REFERENCIA DENTRO DEL GRUPO
  router.get('estados', [EstadosController, 'index'])
  router.get('prioridades', [PrioridadesController, 'index'])
  router.get('categorias', [CategoriasController, 'index'])
  router.get('servicios', [ServiciosController, 'index'])
  // Para usuarios asignables, usamos el index de tu UsuariosController existente
  router.get('usuarios_asignables', [UsuariosController, 'index'])

})
// --- FIN DE TU CÓDIGO ORIGINAL ---


router.get('/test-password', async () => {
  const password = '1'
  const hashed = '$scrypt$n=16384,r=8,p=1$KCOc6mHQZHdIAvH4Z5Fh0A$MA72/3CwHAzLvsoBFb/X03/85V+DjeRT0S65UcLg+tKizrNEgeViEALBbsnOh/teGTIzXv88lNFuPqRZfI1KkA'

  const result = await hash.verify(hashed, password)

  return { result }
})
