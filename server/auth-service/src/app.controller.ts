import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/public.decorator';

@Controller()
@ApiTags('health')
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Check service health' })
  @ApiOkResponse({ description: 'Service is running.' })
  health(): { status: string } {
    return { status: 'ok' };
  }
}
