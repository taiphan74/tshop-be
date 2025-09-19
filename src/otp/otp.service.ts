import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class OtpService {
    constructor(
        private readonly mailerService: MailerService,
        @Inject('REDIS_CLIENT_AUTH') private readonly redisClient: Redis,
        private readonly configService: ConfigService,
    ) {}

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOtp(email: string, expiresInMinutes?: number): Promise<void> {
        // Nếu không truyền expiresInMinutes, sử dụng giá trị từ env (mặc định 5 phút)
        const otpExpiresInMinutes = expiresInMinutes || this.configService.get<number>('OTP_EXPIRES_IN_MINUTES', 5);
        
        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + otpExpiresInMinutes * 60 * 1000);

        const key = `otp:${email}`;
        const value = JSON.stringify({ otp, expiresAt: expiresAt.toISOString() });

        try {
            await this.redisClient.setex(key, otpExpiresInMinutes * 60, value);
        } catch (error) {
            console.error('Failed to store OTP in Redis:', error);
            throw new Error('Unable to store OTP');
        }

        const subject = 'Mã OTP xác thực';
        const text = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau ${otpExpiresInMinutes} phút.`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Mã OTP xác thực</h2>
                <p>Mã OTP của bạn là:</p>
                <div style="font-size: 24px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; border: 2px solid #007bff; border-radius: 5px;">
                    ${otp}
                </div>
                <p>Mã này sẽ hết hạn sau <strong>${otpExpiresInMinutes} phút</strong>.</p>
                <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            </div>
        `;

        await this.mailerService.sendMail(email, subject, text, html);
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const key = `otp:${email}`;

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

    async clearOtp(email: string): Promise<void> {
        const key = `otp:${email}`;
        try {
            await this.redisClient.del(key);
        } catch (error) {
            console.error('Failed to clear OTP from Redis:', error);
        }
    }

    async hasActiveOtp(email: string): Promise<boolean> {
        const key = `otp:${email}`;

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
