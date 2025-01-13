import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for specific origin (React frontend in this case)
  app.enableCors({
    origin: 'http://localhost:5173', // Frontend URL
    methods: 'GET,POST', // Allowed methods
    allowedHeaders: 'Content-Type', // Allowed headers
  });

  // Configure Kafka as the microservice transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
        clientId: 'nestjs-client',
      },
      consumer: {
        groupId: 'nestjs-group',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000); // Nest app listening on port 3000
}
bootstrap();
