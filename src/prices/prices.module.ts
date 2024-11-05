// src/prices/prices.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PricesService],
  controllers: [PricesController],
  exports: [PricesService],
})
export class PricesModule {}
