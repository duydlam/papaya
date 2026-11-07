import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateTenantDto,
  SaveTenantConfigDto,
  TenantListQueryDto,
} from './tenant.dto';
import { TenantService } from './tenant.service';

@Controller('tenants')
export class TenantController {
  constructor(private readonly service: TenantService) {}

  @Get('compare')
  compare(
    @Query('leftTenantId', ParseUUIDPipe) leftTenantId: string,
    @Query('rightTenantId', ParseUUIDPipe) rightTenantId: string,
  ) {
    return this.service.compare(leftTenantId, rightTenantId);
  }

  @Get()
  list(@Query() query: TenantListQueryDto) {
    return this.service.list({
      includeArchived: query.includeArchived === 'true',
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      excludeTenantId: query.excludeTenantId,
    });
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.service.create(dto.config);
  }

  @Get(':id/versions')
  versions(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.versions(id);
  }

  @Get(':id/versions/:version')
  version(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.service.version(id, version);
  }

  @Post(':id/versions/:version/rollback')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.service.restore(id, version);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }

  @Put(':id/config')
  updateConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveTenantConfigDto,
  ) {
    return this.service.updateConfig(id, dto.config);
  }

  @Delete(':id')
  @HttpCode(204)
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.archive(id);
  }
}
