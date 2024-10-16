import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { BlockchainService } from 'src/modules/blockchain/blockchain.service';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { SetAlertDto, SwapDto } from 'src/modules/blockchain/blockchain.dto';

@ApiTags('Blockchain Price Update')
@Controller({ path: 'blockchain/price' })
export class BlockchainController {
  constructor(private readonly service: BlockchainService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async get() {
    return await this.service.get();
  }

  @Post('alert')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: SetAlertDto })
  async setAlert(@Req() req: FastifyRequest) {
    return await this.service.setAlert(req.body);
  }

  @Get('swap')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ type: SwapDto })
  async swap(@Req() req: FastifyRequest) {
    return await this.service.swap(req.query);
  }
}
