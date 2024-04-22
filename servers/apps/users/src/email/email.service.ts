import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

type MailOptions = {
  subject: string;
  email: string;
  name: string;
  activationCode: string;
  template: string;
};

@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}
  async sendEmail(options: MailOptions) {
    const { subject, email, name, activationCode, template } = options;

    await this.mailService.sendMail({
      to: email,
      subject,
      template,
      context: {
        name,
        activationCode,
      },
    });
  }
}
