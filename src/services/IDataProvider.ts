export interface IDataProvider<T = any> {
  getAll(): Promise<T[] | any>;
  getById(id: string | number): Promise<T | undefined | any>;
  create(record: any): Promise<any>;
  update(id: string | number, updates: any): Promise<any>;
  delete(id: string | number): Promise<boolean>;
}

