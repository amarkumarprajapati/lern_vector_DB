import {
    Controller,
    Get,
    Post,
    Query,
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

    @Get('text')
    async getFormattedText(): Promise<{ id: string; embeddingText: string }[]> {
        const items = await this.itemsService.findAll();
        return items.map((item) => ({
            id: (item as any)._id?.toString(),
            embeddingText: this.itemsService.createTextForEmbedding(item),
        }));
    }

    @Post('generate-embeddings')
    async generateEmbeddings() {
        return this.itemsService.generateEmbeddingsForAll();
    }
    @Get('search')
    async search(
        @Query('q') query: string,
        @Query('limit') limit?: string
    ) {
        return this.itemsService.searchSimilar(query, limit ? parseInt(limit, 10) : 5);
    }

}
