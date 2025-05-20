import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'
import UsuariosController from '#controllers/usuarios_controller'
// import Route from '@ioc:Adonis/Core/Route'

const usuariosController = new UsuariosController()

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/usuarios', async (ctx) => {
  // ctx es de tipo HttpContext completo
  return usuariosController.index?.(ctx) ?? ctx.response.json({ message: 'Sin método index' })
})

router.post('/usuarios', async (ctx) => {
  return usuariosController.store(ctx)
})

router
  .get('/dashboard', [() => import('#controllers/dashboard_controller'), 'index'])
  .middleware([middleware.auth({ guards: ['api'] })])

router.post('/login', '#controllers/auth_controller.login')

router.post('/user', '#controllers/login_controller.createUser')

router.group(() => {
  router.get('/tickets', '#controllers/TicketsController.list')
  router.post('/tickets', '#controllers/TicketsController.store')
})
