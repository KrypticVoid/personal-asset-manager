// src/prices/prices.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PricesService } from './prices.service';

@ApiTags('prices')
@ApiBearerAuth()
@Controller('prices')
@UseGuards(JwtAuthGuard)
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post('update')
  @ApiOperation({ summary: 'Manually trigger price update' })
  async triggerPriceUpdate() {
    return this.pricesService.triggerPriceUpdate();
  }
}
