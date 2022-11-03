export interface MongoDBCommandInterface {
  dbName?: string;
  collectionName: string;
  query?: import('mongodb').Filter<any>;
  data?: any;
  fieldName?: string;
  options?: any;
}

export interface MongoDBInterface {
  connectionDomain: string;
  connectionOptions: import('mongodb').MongoClientOptions;
  dbNameList: string[];
  dbListOptions?: import('mongodb').DbOptions[];
}

export interface MongoDBListInterface {
  name: string;
  db: import('mongodb').Db;
}

export interface HandlerGetName {
  dbName?: string;
}

export interface HandlerGetCollection {
  dbName?: string;
  collectionName: string;
}

export interface HandlerBaseRequest {
  dbName?: string;
  collectionName: string;
}

export interface HandlerGetItemSingle extends HandlerBaseRequest {
  query: import('mongodb').Filter<any>;
}

export interface HandlerGetItemMany extends HandlerBaseRequest {
  query: import('mongodb').Filter<any>;
  sort?: Record<string, any>;
  skip?: number;
  limit?: number;
}

export interface HandlerAddItem extends HandlerBaseRequest {
  data: Record<string, any>;
  options?: Record<string, any>;
}

export interface HandlerAddItemMultiple extends HandlerBaseRequest {
  data: Record<string, any>[];
  options?: Record<string, any>;
}

export interface HandlerEditItem extends HandlerBaseRequest {
  query: import('mongodb').Filter<any>;
  data: Record<string, any>[];
  options?: Record<string, any>;
}

export interface HandlerIsCapped extends HandlerBaseRequest {
  options?: Record<string, any>;
}

export interface HandlerGetOptions extends HandlerBaseRequest {
  options?: Record<string, any>;
}

export interface HandlerCountItems extends HandlerBaseRequest {
  query: import('mongodb').Filter<any>;
  options?: Record<string, any>;
}

export interface HandlerGetFieldList extends HandlerBaseRequest {
  fieldName: string;
  options?: Record<string, any>;
}

export interface HandlerGetindices extends HandlerBaseRequest {
  fieldName: string;
}

export interface HandlerRenameColleciton extends HandlerBaseRequest {
  fieldName: string;
  options?: Record<string, any>;
}

export interface HandlerDeleteItem extends HandlerBaseRequest {
  query: import('mongodb').Filter<any>;
  options?: Record<string, any>;
}

export interface HandlerModifyCollection extends HandlerBaseRequest {
  options?: Record<string, any>;
}
