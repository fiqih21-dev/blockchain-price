import { Injectable } from '@nestjs/common';
import { configFn } from 'src/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Moralis from 'moralis';
import { Price } from 'src/modules/database/price.entity';
import { PushEmailService } from 'src/modules/common/push-email/push-email.service';
import { Alert } from 'src/modules/database/alert.entity';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class WsClientService {
  private readonly MORALIS_API_KEY = configFn().MORALIS_API_KEY!;
  private readonly CHAIN_ETH = configFn().CHAIN_ETH!;
  private readonly ADDRESS_WETH = configFn().ADDRESS_WETH!;
  private readonly CHAIN_POL = configFn().CHAIN_POL!;
  private readonly ADDRESS_WMATIC = configFn().ADDRESS_WMATIC!;
  private readonly TIME_SAVE = Number(configFn().TIME_SAVE!);
  private readonly TIME_COMPARE = Number(configFn().TIME_COMPARE!);
  private readonly PERCENT_COMPARE = Number(configFn().PERCENT_COMPARE!);

  constructor(
    @InjectRepository(Price) private readonly priceRepository: Repository<Price>,
    @InjectRepository(Alert) private readonly alertRepository: Repository<Alert>,
    private readonly pushEmailService: PushEmailService,
  ) {}

  async onModuleInit() {
    await Moralis.start({
      apiKey: this.MORALIS_API_KEY,
    });
    await this.savePrice('ETHEREUM', this.CHAIN_ETH, this.ADDRESS_WETH);
    await this.savePrice('POLYGON', this.CHAIN_POL, this.ADDRESS_WMATIC);
  }

  async savePrice(network: string, chain: string, address: string) {
    try {
      // save price to db
      setInterval(
        async () => {
          try {
            const response = await Moralis.EvmApi.token.getTokenPrice({
              chain: chain,
              include: 'percent_change',
              address: address,
            });

            const { tokenName, tokenAddress, tokenSymbol, tokenDecimals, usdPriceFormatted } = response.raw;

            await this.priceRepository.save(
              this.priceRepository.create({
                network: network,
                tokenName: tokenName,
                tokenAddress: tokenAddress,
                tokenSymbol: tokenSymbol,
                tokenDecimals: tokenDecimals,
                price: usdPriceFormatted,
              }),
            );

            const alerts = await this.alertRepository.find({
              where: {
                dollar: MoreThanOrEqual(Number(usdPriceFormatted)),
                chain: network,
              },
            });

            for (const alert of alerts) {
              await this.pushEmailService.pushEmailAlert(tokenName || 'unknown', network, usdPriceFormatted || '0', alert.email);
            }

            console.log(`Saved price for ${tokenSymbol}: $${usdPriceFormatted}`);
          } catch (error) {
            console.error(`Error fetching token price for ${address}`, error);
          }
        },
        this.TIME_SAVE * 60 * 1000,
      );

      // check price
      setInterval(
        async () => {
          try {
            const priceDatas = await this.priceRepository.find({
              where: {
                network: network,
                tokenAddress: address,
              },
              order: {
                createdAt: 'DESC',
              },
              skip: this.TIME_COMPARE / this.TIME_SAVE - 1,
              take: 1,
            });

            const priceData = priceDatas[0];

            if (!priceData) {
              console.warn(`No price data found for token ${address} on network ${network}`);
              return;
            }

            const currentResponse = await Moralis.EvmApi.token.getTokenPrice({
              chain: chain,
              include: 'percent_change',
              address: address,
            });
            if (!currentResponse) return;

            const currentPrice = parseFloat(currentResponse?.raw?.usdPriceFormatted || priceData.price);
            const previousPrice = parseFloat(priceData.price);

            const priceChange = currentPrice - previousPrice;
            const priceChangePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

            if (Math.abs(priceChangePercent) > this.PERCENT_COMPARE) {
              await this.pushEmailService.pushEmail(priceData.tokenSymbol, network, currentPrice.toString(), priceData.price, priceChange.toFixed(2), priceChangePercent.toFixed(2));
            } else {
              console.log(`Price change for ${priceData.tokenSymbol} is within ${this.PERCENT_COMPARE}%, no action taken.`);
            }
          } catch (error) {
            console.error(`Error checking price for ${address}`, error);
          }
        },
        this.TIME_COMPARE * 60 * 1000,
      );
    } catch (error) {
      console.error('Error saving price', error);
    }
  }
}
