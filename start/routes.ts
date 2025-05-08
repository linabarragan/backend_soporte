import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import AuthController from '#controllers/auth_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .get('/dashboard', [() => import('#controllers/dashboard_controller'), 'index'])
  .middleware([middleware.auth({ guards: ['api'] })])

router.post('/login', [AuthController, 'login'])

//router.post('/login', 'LoginController.login')
