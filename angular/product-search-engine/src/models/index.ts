import { environment } from "@environment";

export class Response<Type> {
  isSuccess: boolean = false;
  message: string = '';
  data: Type;
}

export class Brand {
  _id: string = '';
  name: string = '';
  products?: Product[] | any[] = [];
}

export class Category {
  _id: string = '';
  name: string = '';
  products?: Product[] | any[] = [];
}

export class SubCategory {
  _id: string = '';
  name: string = '';
  category: Category = new Category();
  products?: Product[] | any[] = [];
}

export class Product {
  _id: string = '';
  name: string = '';
  brand: Brand = new Brand();
  category: Category = new Category();
  subCategory: SubCategory = new SubCategory();
  colors: any[] = [];
  sizes: any[] = [];
  imgUrl: string = environment.baseUrl + '/logo.png';
  affiliateLink: string = '';
}

export class ProductsRequestCommand {
  name: string = '';
  brands: Brand[] | any[] = [];
  categories: Category[] | any[] = [];
  subCategories: SubCategory[] | any[] = [];
}

export class BlogsRequestCommand {
  title: string = '';
}

export class BlogRequestCommand {
  url: string = '';
}

export class Blog {
  title: string = '';
  url: string = '';
  thumbnail : string = '';
  thumbnailDetail?: string = '';
  content?: string = '';
  createdOn?: string = '';
  updatedOn?: string = '';
  searchTerm: string = '';
}