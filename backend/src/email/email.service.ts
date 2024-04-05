import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { IEmailConfig } from '../config/configuration';

@Injectable()
export class EmailService {
  private nodemailerTransport: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly configService: ConfigService) {
    this.nodemailerTransport = createTransport({
      service: configService.get<IEmailConfig>('email').service,
      auth: {
        user: configService.get<IEmailConfig>('email').user,
        pass: configService.get<IEmailConfig>('email').password,
      },
    });
  }

  sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options);
  }
}
