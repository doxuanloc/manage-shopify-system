declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production';
      PORT?: number;

      DATABASE_URI: string;

      ADMIN_EMAIL: string;
      ADMIN_PHONE_NUMBER: string;
      ADMIN_PASSWORD: string;

      EMAIL_SERVICE: string;
      EMAIL_USER: string;
      EMAIL_PASSWORD: string;

      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;

      GOOGLE_DRIVE_CLIENT_ID: string;
      GOOGLE_DRIVE_CLIENT_SECRET: string;
      GOOGLE_DRIVE_REDIRECT_URI: string;
      GOOGLE_DRIVE_REFRESH_TOKEN: string;
    }
  }
}

export {};
