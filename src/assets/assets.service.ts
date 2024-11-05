// src/assets/assets.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateAssetDto, AssetType } from './dto/asset.dto';
import { sql } from 'kysely';

@Injectable()
export class AssetsService {
  constructor(private db: DatabaseService) {}

  async createAsset(userId: string, createAssetDto: CreateAssetDto) {
    // Validate asset type-specific fields
    if (createAssetDto.type === AssetType.ERC20 && !createAssetDto.quantity) {
      throw new BadRequestException('Quantity is required for ERC20 tokens');
    }
    if (createAssetDto.type === AssetType.ERC721 && !createAssetDto.token_id) {
      throw new BadRequestException('Token ID is required for ERC721 tokens');
    }

    return await this.db.database
      .insertInto('assets')
      .values({
        user_id: userId,
        ...createAssetDto,
      })
      .returning([
        'id',
        'user_id',
        'name',
        'type',
        'contract_address',
        'token_id',
        'quantity',
        'created_at',
        'updated_at',
      ])
      .executeTakeFirst();
  }

  async getAssets(userId: string) {
    return await this.db.database
      .selectFrom('assets')
      .where('user_id', '=', userId)
      .selectAll()
      .execute();
  }

  async getAsset(userId: string, assetId: string) {
    const asset = await this.db.database
      .selectFrom('assets')
      .where('id', '=', assetId)
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst();

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async deleteAsset(userId: string, assetId: string) {
    const result = await this.db.database
      .deleteFrom('assets')
      .where('id', '=', assetId)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException('Asset not found');
    }

    return result;
  }

  async getAssetHistory(userId: string, assetId: string) {
    const asset = await this.getAsset(userId, assetId);

    const history = await this.db.database
      .selectFrom('asset_daily_prices')
      .where('asset_id', '=', assetId)
      .orderBy('date', 'asc')
      .selectAll()
      .execute();

    return {
      asset,
      history,
    };
  }

  async getCurrentPortfolioValue(userId: string) {
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

    const portfolio = result.map((asset) => ({
      ...asset,
      value:
        asset.price * (asset.type === AssetType.ERC20 ? asset.quantity : 1),
    }));

    const totalValue = portfolio.reduce(
      (sum, asset) => sum + (asset.value || 0),
      0,
    );

    return {
      assets: portfolio,
      totalValue,
    };
  }
}
