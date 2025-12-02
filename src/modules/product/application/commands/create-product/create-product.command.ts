/**
 * CreateProductCommand represents the command to create a new product
 */
export class CreateProductCommand {
  readonly name: string;
  readonly price: number;
  readonly image: string;

  constructor(name: string, price: number, image: string) {
    this.name = name;
    this.price = price;
    this.image = image;
  }
}
