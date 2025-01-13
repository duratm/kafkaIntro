import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer, Admin } from 'kafkajs';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private admin: Admin;
  private messageSubject: Subject<string> = new Subject();

  constructor() {
    this.kafka = new Kafka({
      clientId: 'nestjs-client',
      brokers: ['localhost:9092'], // Change to your Kafka broker
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'nestjs-group' });
    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
    await this.admin.connect();

    // Subscribe to the topic from the beginning
    await this.consumer.subscribe({
      topic: 'nestjs-topic',
      fromBeginning: true,
    });

    // Start consuming messages from Kafka
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const receivedMessage = message.value.toString();
        console.log('Received message from Kafka:', receivedMessage);

        // Push the actual Kafka message to the SSE stream
        this.messageSubject.next(receivedMessage);
      },
    });
  }

  // Send message to Kafka topic
  async sendMessage(message: string): Promise<void> {
    await this.producer.send({
      topic: 'nestjs-topic',
      messages: [{ value: message }],
    });
    console.log('Message sent to Kafka:', message);
  }

  async createTopic(topic: string): Promise<void> {
    try {
      await this.admin.createTopics({
        topics: [
          {
            topic,
          },
        ],
        validateOnly: false, // Optional: Set to `true` to just validate the configuration without actually creating the topic
      });
      await this.admin.alterConfigs({
        validateOnly: false,
        resources: [
          {
            type: 2, // Topic type
            name: topic,
            configEntries: [],
          },
        ],
      });
      console.log(`Topic "${topic}" created with custom configuration`);
    } catch (error) {
      console.error(`Error creating or configuring topic "${topic}":`, error);
    }
  }

  // Stream messages via SSE
  getMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  // Disconnect the Kafka producer and consumer when the application shuts down
  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    await this.admin.disconnect();
    console.log('Kafka connections closed.');
  }

  async deleteTopic(topic: string): Promise<void> {
    try {
      await this.admin.deleteTopics({ topics: [topic] });
      console.log(`Topic "${topic}" deleted successfully`);
    } catch (error) {
      console.error(`Error deleting topic "${topic}":`, error);
    }
  }
}
