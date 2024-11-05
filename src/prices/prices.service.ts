// src/prices/prices.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

  constructor(private db: DatabaseService) {}

  private generateMockPrice(basePrice: number): number {
    // Generate a random price within ±10% of base price
    const variation = basePrice * 0.1;
    return basePrice + (Math.random() * variation * 2 - variation);
  }

  private getBasePrice(contractAddress: string): number {
    // Mock base prices for different tokens
    const basePrices: { [key: string]: number } = {
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1.0, // USDC
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 1.0, // USDT
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 30000, // WBTC
      default: 100,
    };

    return basePrices[contractAddress] || basePrices.default;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updatePrices() {
    this.logger.log('Starting daily price update');

    try {
      // Get all unique assets
      const assets = await this.db.database
        .selectFrom('assets')
        .selectAll()
        .execute();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Generate and insert new prices for each asset
      for (const asset of assets) {
        const basePrice = this.getBasePrice(asset.contract_address);
        const price = this.generateMockPrice(basePrice);

        await this.db.database
          .insertInto('asset_daily_prices')
          .values({
            asset_id: asset.id,
            price,
            date: today,
          })
          .execute();

        this.logger.log(`Updated price for asset ${asset.id}: ${price}`);
      }

      this.logger.log('Daily price update completed');
    } catch (error) {
      this.logger.error('Error updating prices:', error);
    }
  }

  // Manual trigger for testing
  async triggerPriceUpdate() {
    await this.updatePrices();
    return { message: 'Price update triggered successfully' };
  }
}
