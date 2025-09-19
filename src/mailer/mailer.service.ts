import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
            port: this.configService.get<number>('MAIL_PORT', 587),
            secure: this.configService.get<boolean>('MAIL_SECURE', false),
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
        });
    }

    async sendMail(
        to: string, 
        subject: string, 
        text: string, 
        html?: string
    ): Promise<nodemailer.SentMessageInfo> {
        const mailOptions: nodemailer.SendMailOptions = {
            from: this.configService.get<string>('MAIL_FROM', 'noreply@example.com'),
            to,
            subject,
            text,
            html: html || text,
        };

        return this.transporter.sendMail(mailOptions);
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            console.error('Mail connection verification failed:', error);
            return false;
        }
    }
}
