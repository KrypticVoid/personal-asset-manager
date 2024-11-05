import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AssetType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
}

export enum BlockchainNetwork {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  // Add other networks as needed
}

export class CreateAssetDto {
  @IsString()
  @ApiProperty({ description: 'Asset name' })
  name: string;

  @IsEnum(AssetType)
  @ApiProperty({ enum: AssetType, description: 'Asset type (ERC20 or ERC721)' })
  type: AssetType;

  @IsString()
  @ApiProperty({ description: 'Asset description' })
  description: string;

  @IsString()
  @ApiProperty({ description: 'Smart contract address' })
  contract_address: string;

  @IsEnum(BlockchainNetwork)
  @ApiProperty({ enum: BlockchainNetwork, description: 'Blockchain network' })
  chain: BlockchainNetwork;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Quantity (for ERC20 tokens)' })
  quantity?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Token ID (for ERC721 tokens)' })
  token_id?: string;
}

export class AssetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AssetType })
  type: AssetType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  contract_address: string;

  @ApiProperty({ enum: BlockchainNetwork })
  chain: BlockchainNetwork;

  @ApiPropertyOptional()
  quantity?: number;

  @ApiPropertyOptional()
  token_id?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
