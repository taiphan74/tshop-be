import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Decimal } from 'decimal.js';

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Detailed description of the product' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Unit price', example: 19.99 })
  @Transform(({ value }) => value ? new Decimal(value) : value)
  @Type(() => Decimal)
  @IsNotEmpty()
  price: Decimal;

  @ApiPropertyOptional({ description: 'Quantity in stock', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_quantity?: number;

  @ApiPropertyOptional({ description: 'Category identifier this product belongs to' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Brand of the product' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Whether the product is active', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}
