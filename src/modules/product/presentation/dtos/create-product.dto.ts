/**
 * CreateProductDto represents the request DTO for creating a product
 */
export class CreateProductDto {
  readonly name: string;
  readonly price: number;
  readonly image: string;
}
