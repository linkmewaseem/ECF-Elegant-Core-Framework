import { CodeGenerator } from './CodeGenerator.js';

export class NotificationGenerator extends CodeGenerator {
  async generate(name, options = {}) {
    const names = this.formatNames(name);
    const stub = `export class {{pascal}}Notification {
  via(notifiable) {
    return ['mail', 'database'];
  }

  toMail(notifiable) {
    return { subject: '{{pascal}} Alert', text: 'Notification message' };
  }
}

export default {{pascal}}Notification;
`;

    const compiled = this.stubCompiler.compileStub('notification', stub, { pascal: names.pascal });
    const targetPath = options.path || `./app/notifications/${names.pascal}Notification.js`;
    return this.writeFile(targetPath, compiled, options);
  }
}

export default NotificationGenerator;
