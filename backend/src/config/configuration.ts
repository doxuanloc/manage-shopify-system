import { MongooseModuleOptions } from '@nestjs/mongoose';

export interface IEmailConfig {
  service: string;
  user: string;
  password: string;
}

export interface ICloudinary {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export interface IGoogleDrive {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  refreshToken: string;
}

export interface IConfiguration {
  port: number;
  database: MongooseModuleOptions;
  email: IEmailConfig;
  cloudinary: ICloudinary;
  googleDrive: IGoogleDrive;
}

export default (): IConfiguration => ({
  port: process.env.PORT ?? 3000,
  database: {
    uri: 'mongodb+srv://locvkv1234:vP4xteuzyj6aEutG@cluster0.t246esn.mongodb.net/?retryWrites=true&w=majority',
  },
  email: {
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    redirectUrl: process.env.GOOGLE_DRIVE_REDIRECT_URI,
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  },
});
