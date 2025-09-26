import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';
import { OtpReason } from './dto/otp-reason.enum';
import { generateOtp } from '../algorithms/generateOtp';

@Injectable()
export class OtpService {
    constructor(
        private readonly mailerService: MailerService,
        @Inject('REDIS_CLIENT_AUTH') private readonly redisClient: Redis,
        private readonly configService: ConfigService,
    ) {}

    async sendOtp(email: string, reason: OtpReason, expiresInMinutes?: number): Promise<void> {
        const otpExpiresInMinutes = expiresInMinutes || this.configService.get<number>('OTP_EXPIRES_IN_MINUTES', 5);
        
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + otpExpiresInMinutes * 60 * 1000);

        const key = `otp:${reason}:${email}`;
        const value = JSON.stringify({ otp, expiresAt: expiresAt.toISOString() });

        try {
            await this.redisClient.setex(key, otpExpiresInMinutes * 60, value);
        } catch (error) {
            console.error('Failed to store OTP in Redis:', error);
            throw new Error('Unable to store OTP');
        }

        const subject = 'OTP Verification Code';
        const text = `Your OTP code is: ${otp}. This code will expire in ${otpExpiresInMinutes} minutes.`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>OTP Verification Code</h2>
                <p>Your OTP code is:</p>
                <div style="font-size: 24px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; border: 2px solid #007bff; border-radius: 5px;">
                    ${otp}
                </div>
                <p>This code will expire in <strong>${otpExpiresInMinutes} minutes</strong>.</p>
                <p>If you did not request this code, please ignore this email.</p>
            </div>
        `;

        await this.mailerService.sendMail(email, subject, text, html);
    }

    async verifyOtp(email: string, otp: string, reason: OtpReason): Promise<boolean> {
        const key = `otp:${reason}:${email}`;

        try {
            const storedValue = await this.redisClient.get(key);

            if (!storedValue) {
                return false;
            }

            const storedOtp = JSON.parse(storedValue);

            if (new Date() > new Date(storedOtp.expiresAt)) {
                await this.redisClient.del(key);
                return false;
            }

            if (storedOtp.otp === otp) {
                await this.redisClient.del(key);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to verify OTP from Redis:', error);
            return false;
        }
    }

    async clearOtp(email: string, reason: OtpReason): Promise<void> {
        const key = `otp:${reason}:${email}`;
        try {
            await this.redisClient.del(key);
        } catch (error) {
            console.error('Failed to clear OTP from Redis:', error);
        }
    }

    async hasActiveOtp(email: string, reason: OtpReason): Promise<boolean> {
        const key = `otp:${reason}:${email}`;

        try {
            const storedValue = await this.redisClient.get(key);

            if (!storedValue) return false;

            const storedOtp = JSON.parse(storedValue);

            if (new Date() > new Date(storedOtp.expiresAt)) {
                await this.redisClient.del(key);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to check OTP status from Redis:', error);
            return false;
        }
    }
}
