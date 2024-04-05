import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() request: Request): string {
    console.log(request.headers);
    return this.appService.getHello();
  }
  @Get('ip')
  async getIp(@Req() request: Request): Promise<string> {
    return request.clientIp;
  }
}
