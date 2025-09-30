import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Decimal } from 'decimal.js';

export class ProductDto {
  @ApiProperty({ format: 'uuid' })
  product_id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: Number, example: 19.99 })
  @Transform(({ value }) => value?.toNumber())
  price: Decimal;

  @ApiProperty({ type: Number, example: 100 })
  stock_quantity: number;

  @ApiPropertyOptional({ format: 'uuid' })
  category_id?: string;

  @ApiPropertyOptional()
  brand?: string;

  @ApiProperty({ default: true })
  is_active: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}
