import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('UPLOAD_DESTINATION', './uploads'),
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
          },
        }),
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE', 5242880),
        },
        fileFilter: (req, file, callback) => {
          const allowedExtensions = configService.get<string>('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif').split(',');
          const fileExt = extname(file.originalname).toLowerCase().replace('.', '');
          if (allowedExtensions.includes(fileExt)) {
            callback(null, true);
          } else {
            callback(new Error('Invalid file type'), false);
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class UploadModule {}