import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Decimal } from 'decimal.js';
import { ColumnNumericTransformer } from '../common/transformers/column-numeric.transformer';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  product_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: new ColumnNumericTransformer() })
  price: Decimal;

  @Column({ type: 'int', name: 'stock_quantity', default: 0 })
  stock_quantity: number;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  category_id?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brand?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
