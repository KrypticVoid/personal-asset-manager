import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrivyLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Privy.io JWT token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  privyToken: string;
}
