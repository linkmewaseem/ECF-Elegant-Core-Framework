import HomeController from '../app/Http/Controllers/HomeController.js';

export default function registerWebRoutes(router) {
  router.get('/', [HomeController, 'index']).name('home');
  router.get('/about', (req, res) => res.send('About ECF Framework')).name('about');
}
