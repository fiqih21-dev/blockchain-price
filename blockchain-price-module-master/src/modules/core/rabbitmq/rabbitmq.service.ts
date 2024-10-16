import { Injectable, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { configFn } from 'src/config';
import { ERabbitErrorCode, IRabbitMessage } from 'src/modules/core/rabbitmq/rabbitmq.dto';
import { RabbitError } from 'src/modules/common/app-error/rabbit-error';
import { rabbitLoggerService } from 'src/modules/common/utils/common.utils';

import { BlockchainService } from 'src/modules/blockchain/blockchain.service';

@Injectable()
export class RabbitmqService {
  private connection!: amqplib.Connection;
  private channel!: amqplib.Channel;
  private queueReceive!: string;
  private isShuttingDown: boolean = false;
  private reconnectCount: number = 0;
  private isConsumerInitialized: boolean = false;
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(private readonly blockchainService: BlockchainService) {}

  async onModuleInit() {
    const { RABBIT_RECEIVE_FROM } = configFn();
    this.queueReceive = RABBIT_RECEIVE_FROM!;
    await this.initializeRabbitMQ();
    await this.startConsumingManagerMessage();
  }

  async onModuleDestroy() {
    this.isShuttingDown = true;
    await this.cleanupRabbitMQ();
  }

  private async initializeRabbitMQ() {
    try {
      const { RABBIT_PROTOCOL, RABBIT_HOSTNAME, RABBIT_PORT, RABBIT_USERNAME, RABBIT_PASSWORD, RABBIT_VHOST } = configFn();

      this.connection = await amqplib.connect({
        protocol: RABBIT_PROTOCOL,
        hostname: RABBIT_HOSTNAME,
        port: parseInt(RABBIT_PORT!),
        username: RABBIT_USERNAME,
        password: RABBIT_PASSWORD,
        vhost: RABBIT_VHOST,
        heartbeat: 60,
      });

      this.connection.on('close', async () => {
        await this.reconnect();
      });

      this.channel = await this.connection.createChannel();

      await this.channel.prefetch(200);

      await this.channel.assertQueue(this.queueReceive, {
        durable: true,
      });

      this.channel.on('return', (rawMessage: amqplib.ConsumeMessage) => {
        this.logger.warn(`Message returned on replyTo ${rawMessage.fields.routingKey} with data: ${rawMessage.content.toString()}`);
      });

      this.logger.log('RabbitMQ connection, channel, and queue initialized');
      this.reconnectCount = 0;
    } catch (error) {
      this.logger.error('Error Initializing RabbitMQ:', (<Error>error).stack);
      await this.reconnect();
    }
  }

  private async cleanupRabbitMQ() {
    try {
      if (await this.isChannelReady()) {
        await this.channel.close();
        await this.connection.close();
      }
      this.logger.log('RabbitMQ connection and channel closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection and channel:', (<Error>error).stack);
    }
  }

  private async isChannelReady(): Promise<boolean> {
    try {
      if (!this.channel) return false;
      await this.channel.checkQueue(this.queueReceive);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async reconnect() {
    if (this.isShuttingDown) return;

    const delay = Math.pow(2, this.reconnectCount) * 1000;
    this.logger.warn(`Reconnecting to RabbitMQ in ${delay / 1000} seconds...`);

    setTimeout(async () => {
      this.reconnectCount++;

      this.isConsumerInitialized = false;
      await this.initializeRabbitMQ();
      if (!this.isConsumerInitialized) await this.startConsumingManagerMessage();
    }, delay);
  }

  private send(message: IRabbitMessage, replyTo: string): void {
    try {
      const responseTime = Date.now() - message.startTime!;
      delete message.startTime;

      this.channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(message)), {
        correlationId: message.correlationId,
        mandatory: true,
      });

      if (configFn().APP_ENABLE_LOG !== 'true') return;
      if (!message.error) {
        rabbitLoggerService({
          level: 'log',
          correlationId: message.correlationId,
          error: message.error,
          command: message.command,
          responseTime: responseTime,
        });
      } else {
        rabbitLoggerService({
          level: 'error',
          correlationId: message.correlationId,
          error: message.error.type,
          command: message.command,
          responseTime: responseTime,
        });
      }
    } catch (error) {
      this.logger.error('Error on send to RabbitMQ:', (<Error>error).stack);
      throw error;
    }
  }

  private async startConsumingManagerMessage(): Promise<void> {
    try {
      if (this.isConsumerInitialized || !(await this.isChannelReady())) return;

      this.channel.consume(
        this.queueReceive,
        async (rawMessage: amqplib.ConsumeMessage | null) => {
          if (!rawMessage) return;

          const messageData = <IRabbitMessage>JSON.parse(rawMessage.content.toString());
          messageData.startTime = Date.now();

          try {
            switch (messageData.command) {
              case 'get:price/oneDay':
                this.send(
                  {
                    ...messageData,
                    data: await this.blockchainService.getOneDayPrice(),
                  },
                  rawMessage.properties.replyTo,
                );
                break;
              case 'post:price/alert':
                this.send(
                  {
                    ...messageData,
                    data: await this.blockchainService.setAlert(messageData.data),
                  },
                  rawMessage.properties.replyTo,
                );
                break;
              case 'post:price/swap':
                this.send(
                  {
                    ...messageData,
                    data: await this.blockchainService.swap(messageData.data),
                  },
                  rawMessage.properties.replyTo,
                );
                break;
              default:
                throw new RabbitError(ERabbitErrorCode.INVALID_COMMAND);
            }
          } catch (error) {
            if (error instanceof RabbitError) {
              this.send(
                {
                  ...messageData,
                  error: error.generateError(),
                },
                rawMessage.properties.replyTo,
              );
            } else {
              this.send(
                {
                  ...messageData,
                  error: {
                    type: ERabbitErrorCode.UNKNOWN,
                    httpError: null,
                  },
                },
                rawMessage.properties.replyTo,
              );
            }
          } finally {
            this.channel.ack(rawMessage);
          }
        },
        { noAck: false },
      );

      this.isConsumerInitialized = true;
    } catch (error) {
      this.logger.error('Error on cosuming manager message using RabbitMQ:', (<Error>error).stack);
    }
  }
}
