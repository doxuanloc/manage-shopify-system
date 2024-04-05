export const jwtConstants = {
  secret: 'secretKey',
  accessTokenExpiry: '3600s',
  refreshTokenExpiry: '1d',
};

export enum ECodeType {
  RESET_PASSWORD = 'RESET_PASSWORD',
}
