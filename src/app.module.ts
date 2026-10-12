import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsModule } from './items/items.module.js';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ItemsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
