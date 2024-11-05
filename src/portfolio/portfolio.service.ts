// src/portfolio/portfolio.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { sql } from 'kysely';

@Injectable()
export class PortfolioService {
  constructor(private db: DatabaseService) {}

  async getPortfolioAnalytics(userId: string) {
    // Get current portfolio value
    const currentValue = await this.getCurrentValue(userId);

    // Get historical values
    const historicalValues = await this.getHistoricalValues(userId);

    // Calculate PnL
    const pnl = await this.calculatePnL(userId);

    return {
      currentValue,
      historicalValues,
      pnl,
    };
  }

  private async getCurrentValue(userId: string) {
    const result = await this.db.database
      .selectFrom('assets')
      .leftJoin('asset_daily_prices', (join) =>
        join
          .onRef('assets.id', '=', 'asset_daily_prices.asset_id')
          .on('asset_daily_prices.date', '=', sql`DATE(CURRENT_TIMESTAMP)`),
      )
      .where('assets.user_id', '=', userId)
      .select([
        'assets.id',
        'assets.name',
        'assets.type',
        'assets.quantity',
        'asset_daily_prices.price',
      ])
      .execute();

    return result.reduce((total, asset) => {
      const value = asset.price * (asset.quantity || 1);
      return total + value;
    }, 0);
  }

  private async getHistoricalValues(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.db.database
      .selectFrom('asset_daily_prices')
      .innerJoin('assets', 'assets.id', 'asset_daily_prices.asset_id')
      .where('assets.user_id', '=', userId)
      .where('asset_daily_prices.date', '>=', thirtyDaysAgo)
      .select([
        'asset_daily_prices.date',
        sql<number>`SUM(asset_daily_prices.price * COALESCE(assets.quantity, 1))`.as(
          'total_value',
        ),
      ])
      .groupBy('asset_daily_prices.date')
      .orderBy('asset_daily_prices.date', 'asc')
      .execute();
  }

  private async calculatePnL(userId: string) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayValue, yesterdayValue] = await Promise.all([
      this.getCurrentValue(userId),
      this.getValueAtDate(userId, yesterday),
    ]);

    const dayPnL = todayValue - yesterdayValue;
    const dayPnLPercentage = (dayPnL / yesterdayValue) * 100;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDayValue = await this.getValueAtDate(userId, thirtyDaysAgo);
    const thirtyDayPnL = todayValue - thirtyDayValue;
    const thirtyDayPnLPercentage = (thirtyDayPnL / thirtyDayValue) * 100;

    return {
      daily: {
        value: dayPnL,
        percentage: dayPnLPercentage,
      },
      thirtyDay: {
        value: thirtyDayPnL,
        percentage: thirtyDayPnLPercentage,
      },
    };
  }

  private async getValueAtDate(userId: string, date: Date) {
    const result = await this.db.database
      .selectFrom('assets')
      .leftJoin('asset_daily_prices', (join) =>
        join
          .onRef('assets.id', '=', 'asset_daily_prices.asset_id')
          .on('asset_daily_prices.date', '=', sql`DATE(${date})`),
      )
      .where('assets.user_id', '=', userId)
      .select(['assets.quantity', 'asset_daily_prices.price'])
      .execute();

    return result.reduce((total, asset) => {
      const value = asset.price * (asset.quantity || 1);
      return total + value;
    }, 0);
  }
}
