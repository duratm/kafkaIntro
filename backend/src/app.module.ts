import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka.module';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [KafkaModule],
  controllers: [KafkaController],
  providers: [],
})
export class AppModule {}
