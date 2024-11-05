import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange Privy token for JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        privyToken: {
          type: 'string',
          description: 'Privy.io JWT token',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT token',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
        },
        user_id: {
          type: 'string',
        },
      },
    },
  })
  async login(@Body('privyToken') privyToken: string) {
    return this.authService.login(privyToken);
  }
}
