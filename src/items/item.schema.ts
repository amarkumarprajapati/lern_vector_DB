import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
    collection: 'products',
})
export class Item extends Document {
    @Prop()
    asin: string;

    @Prop({ required: true })
    title: string;

    @Prop()
    url: string;

    @Prop()
    brand: string;

    @Prop({ required: true })
    price: string;

    @Prop()
    mrp: string;

    @Prop()
    discount: string;

    @Prop()
    availability: string;

    @Prop()
    sold_by: string;

    @Prop()
    ships_from: string;

    @Prop({ type: [String], default: [] })
    features: string[];

    @Prop()
    description: string;

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: [String], default: [] })
    categoryIds: string[];
}

export const ItemSchema = SchemaFactory.createForClass(Item);