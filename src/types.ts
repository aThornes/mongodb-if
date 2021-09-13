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

export interface MongoDBCommandInterface {
  dbName?: string;
  collectionName: string;
  query?: import('mongodb').Filter<any>;
  data?: any;
  fieldName?: string;
  options?: any;
}
