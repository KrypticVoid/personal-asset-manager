export interface JwtPayload {
  sub: string;
  privyId: string;
  iat?: number;
  exp?: number;
}
