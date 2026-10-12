import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './item.schema.js';
import { pipeline } from '@xenova/transformers';

@Injectable()
export class ItemsService {
    private extractor: any = null;

    constructor(
        @InjectModel(Item.name)
        private readonly itemModel: Model<Item>,
    ) { }

    async findAll(): Promise<Item[]> {
        return this.itemModel.find().exec();
    }


    createTextForEmbedding(item: Partial<Item>): string {
        const parts: string[] = [];

        if (item.title) {
            parts.push(`Title: ${item.title}`);
        }

        if (item.brand) {
            parts.push(`Brand: ${item.brand}`);
        }

        if (item.sold_by) {
            parts.push(`Sold By: ${item.sold_by}`);
        }

        if (item.features && item.features.length > 0) {
            parts.push(`Features:\n- ${item.features.join('\n- ')}`);
        }

        if (item.description) {
            parts.push(`Description: ${item.description}`);
        }

        return parts.join('\n\n');
    }
    private async getExtractor() {
        if (!this.extractor) {
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        return this.extractor;
    }
    async generateVector(text: string): Promise<number[]> {
        const extractor = await this.getExtractor();
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    async generateEmbeddingsForAll(): Promise<{ message: string; updatedCount: number }> {
        const items = await this.itemModel.find().exec();
        let updatedCount = 0;

        for (const item of items) {
            const embeddingText = this.createTextForEmbedding(item);
            if (!embeddingText.trim()) continue;

            const vector = await this.generateVector(embeddingText);
            item.embedding = vector;
            await item.save();
            updatedCount++;
        }

        return {
            message: 'Embeddings generated and updated successfully',
            updatedCount,
        };
    }
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async searchSimilar(query: string, limit: number = 5): Promise<any[]> {
    
        const queryVector = await this.generateVector(query);
        try {
            const results = await this.itemModel.aggregate([
                {
                    $vectorSearch: {
                        index: 'vector_index',
                        path: 'embedding',
                        queryVector: queryVector,
                        numCandidates: limit * 10,
                        limit: limit,
                    },
                },
                {
                    $project: {
                        title: 1,
                        brand: 1,
                        price: 1,
                        sold_by: 1,
                        features: 1,
                        description: 1,
                        score: { $meta: 'vectorSearchScore' },
                    },
                },
            ]).exec();

            if (results && results.length > 0) {
                return results;
            }
        } catch (e) {
   
        }

     
        const items = await this.itemModel.find({
            embedding: { $exists: true, $not: { $size: 0 } },
        }).exec();

        const scored = items.map((item) => ({
            id: item._id,
            title: item.title,
            brand: item.brand,
            price: item.price,
            sold_by: item.sold_by,
            features: item.features,
            description: item.description,
            score: this.cosineSimilarity(queryVector, item.embedding),
        }));

        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, limit);
    }
}
