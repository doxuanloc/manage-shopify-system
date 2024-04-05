import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';
import { google } from 'googleapis';
import { ICloudinary, IGoogleDrive } from '../config/configuration';
import { CLOUDINARY, GOOGLE_DRIVE } from './constants';

export const fileProviders = [
  {
    provide: CLOUDINARY,
    useFactory: (configService: ConfigService) => {
      v2.config(configService.get<ICloudinary>('cloudinary'));
      return v2;
    },
    inject: [ConfigService],
  },
  {
    provide: GOOGLE_DRIVE,
    useFactory: async (configService: ConfigService) => {
      const { clientId, clientSecret, redirectUrl, refreshToken } =
        configService.get<IGoogleDrive>('googleDrive');

      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUrl,
      );

      oauth2Client.setCredentials({ refresh_token: refreshToken });

      return google.drive({ version: 'v3', auth: oauth2Client });
    },
    inject: [ConfigService],
  },
];
