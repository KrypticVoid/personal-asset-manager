import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely';

export interface Database {
  users: UserTable;
  assets: AssetTable;
  asset_daily_prices: AssetDailyPriceTable;
}

export interface UserTable {
  id: Generated<string>;
  privy_id: string;
  created_at: ColumnType<Date>;
  updated_at: ColumnType<Date>;
}

export interface AssetTable {
  id: Generated<string>;
  user_id: string;
  name: string;
  type: 'ERC20' | 'ERC721';
  description: string;
  contract_address: string;
  chain: string;
  quantity?: number; // Only for ERC20
  token_id?: string; // Only for ERC721
  created_at: ColumnType<Date>;
  updated_at: ColumnType<Date>;
}

export interface AssetDailyPriceTable {
  id: Generated<string>;
  asset_id: string;
  price: number;
  date: ColumnType<Date>;
  created_at: ColumnType<Date>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type Asset = Selectable<AssetTable>;
export type NewAsset = Insertable<AssetTable>;
export type AssetUpdate = Updateable<AssetTable>;

export type AssetDailyPrice = Selectable<AssetDailyPriceTable>;
export type NewAssetDailyPrice = Insertable<AssetDailyPriceTable>;
