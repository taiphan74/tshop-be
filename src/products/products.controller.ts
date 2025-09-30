import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { UserRole } from '../users/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, type: [ProductDto] })
  async findAll(): Promise<ProductDto[]> {
    const products = await this.productsService.findAll();
    return products.map(product => plainToInstance(ProductDto, product));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, type: ProductDto })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<ProductDto> {
    const product = await this.productsService.findOne(id);
    return plainToInstance(ProductDto, product);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new product (admin only)' })
  @ApiResponse({ status: 201, type: ProductDto })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductDto> {
    const product = await this.productsService.create(createProductDto);
    return plainToInstance(ProductDto, product);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (admin only)' })
  @ApiResponse({ status: 200, type: ProductDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductDto> {
    const product = await this.productsService.update(id, updateProductDto);
    return plainToInstance(ProductDto, product);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}
