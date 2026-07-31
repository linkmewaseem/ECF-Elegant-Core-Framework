import Controller from './Controller.js';

export class HomeController extends Controller {
  async index(req, res) {
    return res.json({
      message: 'Welcome to ECF Framework Enterprise App',
      docs: 'https://ecf.dev/docs'
    });
  }
}

export default HomeController;
