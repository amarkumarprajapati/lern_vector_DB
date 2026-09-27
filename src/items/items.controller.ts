import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { ItemsService } from './items.service.js';
import { Item } from './item.schema.js';
@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }
    @Get()
    async findAll(): Promise<Item[]> {
        return this.itemsService.findAll();
    }
}
