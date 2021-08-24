interface MongoDBInterface {
  connectionDomain: string;
  connectionOptions: import('mongodb').MongoClientOptions;
  dbNameList: string[];
  dbListOptions?: import('mongodb').DbOptions[];
}

interface MongoDBListInterface {
  name: string;
  db: import('mongodb').Db;
}

interface MongoDBCommandInterface {
  dbName?: string;
  collectionName: string;
  query?: import('mongodb').Filter<any>;
  data?: any;
  fieldName?: string;
  options?: any;
}
