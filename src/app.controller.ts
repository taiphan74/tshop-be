import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  getHello(): object {
    return {
      message: 'TShop API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}