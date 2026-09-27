import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './item.schema.js';

@Injectable()
export class ItemsService {
    constructor(
        @InjectModel(Item.name)
        private readonly itemModel: Model<Item>,
    ) { }

    async findAll(): Promise<Item[]> {
        return this.itemModel.find().exec();
    }
}
