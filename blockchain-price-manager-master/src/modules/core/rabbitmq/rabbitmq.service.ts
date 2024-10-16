import { Injectable, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { configFn } from 'src/config';
import {
  ERabbitErrorCode,
  IRabbitMessage,
} from 'src/modules/core/rabbitmq/rabbitmq.dto';
import EventEmitter from 'events';
import { AppError } from 'src/modules/common/app-error/app-error';

@Injectable()
export class RabbitmqService {
  private connection!: amqplib.Connection;
  private channel!: amqplib.Channel;
  private queueSend!: string;
  private queueReceive!: string;
  private readonly eventEmitter: EventEmitter = new EventEmitter();
  private isShuttingDown: boolean = false;
  private reconnectCount: number = 0;
  private isConsumerInitialized: boolean = false;
  private readonly rabbitRequestTimeout: number = parseInt(
    configFn().RABBIT_REQUEST_TIMEOUT!,
  );
  private readonly logger = new Logger(RabbitmqService.name);

  async onModuleInit() {
    const { RABBIT_SEND_TO } = configFn();
    this.queueSend = RABBIT_SEND_TO!;
    await this.initializeRabbitMQ();
    await this.consumeMessages();
  }

  async onModuleDestroy() {
    this.isShuttingDown = true;
    await this.cleanupRabbitMQ();
  }

  private async initializeRabbitMQ() {
    try {
      const {
        RABBIT_PROTOCOL,
        RABBIT_HOSTNAME,
        RABBIT_PORT,
        RABBIT_USERNAME,
        RABBIT_PASSWORD,
        RABBIT_VHOST,
      } = configFn();

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

      await this.channel.assertQueue(this.queueSend, {
        durable: true,
      });
      const { queue } = await this.channel.assertQueue('', { exclusive: true });
      this.queueReceive = queue;

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
      this.logger.error(
        'Error closing RabbitMQ connection and channel:',
        (<Error>error).stack,
      );
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
      if (!this.isConsumerInitialized) await this.consumeMessages();
    }, delay);
  }

  private async consumeMessages() {
    try {
      if (this.isConsumerInitialized || !(await this.isChannelReady())) return;

      this.channel.consume(
        this.queueReceive,
        (rawMessage: amqplib.ConsumeMessage | null) => {
          if (!rawMessage) return;

          const correlationId = rawMessage.properties.correlationId;
          const responseData = <IRabbitMessage>(
            JSON.parse(rawMessage.content.toString())
          );

          this.eventEmitter.emit(correlationId, responseData);
          this.channel.ack(rawMessage);
        },
        { noAck: false },
      );

      this.isConsumerInitialized = true;
    } catch (error) {
      this.logger.error(
        'Error on cosuming replyTo message using RabbitMQ:',
        (<Error>error).stack,
      );
    }
  }

  async send<T>(message: IRabbitMessage): Promise<IRabbitMessage<T>> {
    try {
      this.channel.sendToQueue(
        this.queueSend,
        Buffer.from(JSON.stringify(message)),
        {
          correlationId: message.correlationId,
          replyTo: this.queueReceive,
        },
      );

      return await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.eventEmitter.off(message.correlationId, listener);
          reject(new Error(ERabbitErrorCode.MANAGER_CONSUME_TIMEOUT));
        }, this.rabbitRequestTimeout * 1000);

        const listener = (responseData: IRabbitMessage<T>) => {
          clearTimeout(timeoutId);
          if (!responseData.error) {
            resolve(responseData);
            return;
          }

          if (!responseData.error.httpError) {
            reject(new Error(responseData.error.type));
            return;
          }

          reject(
            new AppError({
              statusCode: responseData.error.httpError.statusCode,
              message: responseData.error.httpError.message,
              debug: responseData,
            }),
          );
        };

        this.eventEmitter.once(message.correlationId, listener);
      });
    } catch (error) {
      const isSafeError =
        error instanceof AppError ||
        (error instanceof Error &&
          Object.values(ERabbitErrorCode).includes(
            <ERabbitErrorCode>error.message,
          ));

      if (isSafeError) throw error;

      throw new Error(ERabbitErrorCode.MANAGER_SEND_TO_RABBIT_ERROR);
    }
  }
}
