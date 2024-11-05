// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import * as jose from 'jose';

@Injectable()
export class AuthService {
  private privyPublicKey: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private db: DatabaseService,
  ) {
    this.privyPublicKey = this.configService.get<string>(
      'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAES3UK0rWSseUm9xbsJ+8IuFNEw5lXXXH3M2Bq1hMg/hPK8ZKavUJ42xD2eyt94VIyk4qnBLOyp/bpfAN1YRzChw==',
    );
  }

  private async verifyPrivyToken(
    privyToken: string,
  ): Promise<{ userId: string }> {
    try {
      // Verify the Privy token
      const unverifiedPayload = jose.decodeJwt(privyToken);

      // In production, you would verify the token signature using Privy's SDK
      // For development, we'll just check the basic structure
      if (!unverifiedPayload.sub) {
        throw new Error('Invalid token payload');
      }

      // For development, you can log the payload to see what's available
      console.log('Privy token payload:', unverifiedPayload);

      return { userId: unverifiedPayload.sub };
    } catch (error) {
      console.error('Privy token verification failed:', error);
      throw new UnauthorizedException('Invalid Privy token');
    }
  }

  async validateUser(privyToken: string) {
    const { userId } = await this.verifyPrivyToken(privyToken);

    // Check if user exists, if not create new user
    const existingUser = await this.db.database
      .selectFrom('users')
      .where('privy_id', '=', userId)
      .selectAll()
      .executeTakeFirst();

    if (!existingUser) {
      const newUser = await this.db.database
        .insertInto('users')
        .values({
          privy_id: userId,
        })
        .returning(['id', 'privy_id'])
        .executeTakeFirst();

      return newUser;
    }

    return existingUser;
  }

  async login(privyToken: string) {
    const user = await this.validateUser(privyToken);

    const payload = {
      sub: user.id,
      privyId: user.privy_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user_id: user.id,
    };
  }
}
