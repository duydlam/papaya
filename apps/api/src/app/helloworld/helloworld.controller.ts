import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHelloWorldDto, UpdateHelloWorldDto } from './helloworld.dto';
import { HelloWorldService } from './helloworld.service';

@Controller('helloworld')
@UseGuards(JwtAuthGuard)
export class HelloWorldController {
  constructor(private readonly service: HelloWorldService) {}
  @Get() findAll() {
    return this.service.findAll();
  }
  @Get(':id') findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }
  @Post() create(@Body() dto: CreateHelloWorldDto) {
    return this.service.create(dto.message);
  }
  @Patch(':id') update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHelloWorldDto,
  ) {
    return this.service.update(id, dto.message);
  }
  @Delete(':id') @HttpCode(204) delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
