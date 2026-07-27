export interface IDataProvider<T = any> {
  getAll(): Promise<T>;
  getById(id: string | number): Promise<any | undefined>;
  create(record: any): Promise<any>;
  update(id: string | number, updates: any): Promise<any>;
  delete(id: string | number): Promise<boolean>;
}
