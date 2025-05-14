import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/', async () => {
  return {
    hello: 'world',
  }
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
