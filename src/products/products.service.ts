import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.repo.create({
      ...createProductDto,
      stock_quantity: createProductDto.stock_quantity ?? 0,
      is_active: createProductDto.is_active ?? true,
    });
    return this.repo.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { product_id: id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
  }
}
