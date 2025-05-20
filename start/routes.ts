import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'

import { middleware } from '#start/kernel'
import UsuariosController from '#controllers/usuarios_controller'
// import Route from '@ioc:Adonis/Core/Route'
import AuthController from '#controllers/auth_controller'

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

router.group(() => {
  router.get('/tickets', '#controllers/TicketsController.list')
  router.post('/tickets', '#controllers/TicketsController.store')
})

router.get('/test-password', async () => {
  const password = '1'
  const hashed = '$scrypt$n=16384,r=8,p=1$KCOc6mHQZHdIAvH4Z5Fh0A$MA72/3CwHAzLvsoBFb/X03/85V+DjeRT0S65UcLg+tKizrNEgeViEALBbsnOh/teGTIzXv88lNFuPqRZfI1KkA'

  const result = await hash.verify(hashed, password)

  return { result }
})
