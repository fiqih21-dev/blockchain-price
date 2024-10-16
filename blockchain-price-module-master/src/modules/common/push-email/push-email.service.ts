import { Injectable, HttpStatus } from '@nestjs/common';
import { configFn } from 'src/config';
import { RabbitError } from 'src/modules/common/app-error/rabbit-error';
import { ERabbitErrorCode } from 'src/modules/core/rabbitmq/rabbitmq.dto';
import MailService from '@sendgrid/mail';

@Injectable()
export class PushEmailService {
  private readonly EMAIL_ADMIN_SENDGRID = configFn().EMAIL_ADMIN_SENDGRID!;
  private readonly SENDGRID_API_KEY = configFn().SENDGRID_API_KEY!;
  private readonly SENDGRID_EMAIL_FROM = configFn().SENDGRID_EMAIL_FROM!;
  private readonly SENDGRID_TEMPLATE_ID_PRICE = configFn().SENDGRID_TEMPLATE_ID_PRICE!;
  private readonly SENDGRID_TEMPLATE_ID_ALERT = configFn().SENDGRID_TEMPLATE_ID_ALERT!;

  constructor() {
    MailService.setApiKey(this.SENDGRID_API_KEY);
  }

  async pushEmail(tokenName: string, network: string, currentPrice: string, oldPrice: string, differentPrice: string, percentDiffPrice: string) {
    try {
      const msg = {
        to: this.EMAIL_ADMIN_SENDGRID,
        from: {
          email: this.SENDGRID_EMAIL_FROM,
          name: 'Price Info',
        },
        templateId: this.SENDGRID_TEMPLATE_ID_PRICE,
        dynamic_template_data: {
          tokenName: tokenName,
          network: network,
          currentPrice: currentPrice,
          oldPrice: oldPrice,
          differentPrice: differentPrice,
          percentDiffPrice: percentDiffPrice,
        },
      };

      MailService.send(msg)
        .then(() => {
          console.log('Email sent');
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      throw new RabbitError(ERabbitErrorCode.HTTP, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to push email',
      });
    }
  }

  async pushEmailAlert(tokenName: string, network: string, price: string, email: string) {
    try {
      const msg = {
        to: email,
        from: {
          email: this.SENDGRID_EMAIL_FROM,
          name: 'Price Info',
        },
        templateId: this.SENDGRID_TEMPLATE_ID_ALERT,
        dynamic_template_data: {
          tokenName: tokenName,
          network: network,
          price: price,
        },
      };

      MailService.send(msg)
        .then(() => {
          console.log('Email sent');
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      throw new RabbitError(ERabbitErrorCode.HTTP, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to push email',
      });
    }
  }
}
