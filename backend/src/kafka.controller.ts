import { Controller, Post, Body, Sse, Res } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { Response } from 'express';
import {map, Observable} from 'rxjs';

@Controller('kafka')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  // Endpoint to send a message to Kafka
  @Post('send')
  async sendMessage(@Body('message') message: string) {
    await this.kafkaService.sendMessage(message);
  }

  // Endpoint to create a new Kafka topic
  @Post('create-topic')
  async createTopic(@Body('topic') topic: string) {
    await this.kafkaService.createTopic(topic);
  }

  // Endpoint to delete an existing Kafka topic
  @Post('delete-topic')
  async deleteTopic(@Body('topic') topic: string) {
    await this.kafkaService.deleteTopic(topic);
  }

  // SSE endpoint to stream Kafka messages to the frontend
  @Sse('stream')
  streamMessages(@Res() res: Response): Observable<any> {
    return this.kafkaService.getMessages().pipe(
      map((message) => {
        res.write(`data: ${message}\n\n`);
        return {}; // Empty object since we’re just writing to the response
      }),
    );
  }
}
