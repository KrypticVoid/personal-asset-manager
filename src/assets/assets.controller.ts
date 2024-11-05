import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssetsService } from './assets.service';
import { CreateAssetDto, AssetResponseDto } from './dto/asset.dto';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ type: AssetResponseDto })
  async createAsset(@Request() req, @Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.createAsset(req.user.userId, createAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets for the user' })
  @ApiResponse({ type: [AssetResponseDto] })
  async getAssets(@Request() req) {
    return this.assetsService.getAssets(req.user.userId);
  }

  @Get(':assetId')
  @ApiOperation({ summary: 'Get a specific asset' })
  @ApiResponse({ type: AssetResponseDto })
  async getAsset(@Request() req, @Param('assetId') assetId: string) {
    return this.assetsService.getAsset(req.user.userId, assetId);
  }

  @Delete(':assetId')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ type: AssetResponseDto })
  async deleteAsset(@Request() req, @Param('assetId') assetId: string) {
    return this.assetsService.deleteAsset(req.user.userId, assetId);
  }

  @Get(':assetId/history')
  @ApiOperation({ summary: 'Get asset price history' })
  async getAssetHistory(@Request() req, @Param('assetId') assetId: string) {
    return this.assetsService.getAssetHistory(req.user.userId, assetId);
  }

  @Get('portfolio/value')
  @ApiOperation({ summary: 'Get current portfolio value' })
  async getCurrentPortfolioValue(@Request() req) {
    return this.assetsService.getCurrentPortfolioValue(req.user.userId);
  }
}
