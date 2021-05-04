import {
  Db,
  FilterQuery,
  MongoClientCommonOption,
  MongoClientOptions,
} from 'mongodb';

export interface MongoDBInterface {
  connectionDomain: string;
  connectionOptions: MongoClientOptions;
  dbNameList: string[];
  dbListOptions?: MongoClientCommonOption[];
}

export interface MongoDBListInterface {
  name: string;
  db: Db;
}

export interface MongoDBCommandInterface {
  dbName?: string;
  collectionName: string;
  query?: FilterQuery<any>;
  data?: any;
  fieldName?: string;
}
