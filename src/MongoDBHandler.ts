import {
  Db,
  FilterQuery,
  MongoClient,
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

export class MongoDBHandler {
  dbClientObj: MongoClient;
  dbObj: MongoDBInterface;
  dbList: MongoDBListInterface[];

  /**
   * Mongo Database Interface Handler - Handles all data communication between application and the MongoDB database
   * @param {MongoDBInterface} MongoData Connection Options
   */
  constructor(MongoData: MongoDBInterface) {
    const {
      connectionDomain,
      connectionOptions,
      dbNameList,
      dbListOptions,
    } = MongoData;

    this.dbObj = {
      connectionDomain,
      dbNameList,
      connectionOptions,
      dbListOptions,
    };
  }

  /**
   * Validate the caller includes the required parameters
   */
  private validateCommandParamPresence = (
    cmdParams: MongoDBCommandInterface,
    dbName?: boolean,
    collectionName?: boolean,
    query?: boolean,
    data?: boolean,
    fieldName?: boolean
  ): Error => {
    let failItem = null;
    if (dbName && !cmdParams.dbName) failItem = 'dbName';
    else if (collectionName && !cmdParams.collectionName)
      failItem = 'collectionName';
    else if (query && !cmdParams.query) failItem = 'query';
    else if (data && !cmdParams.data) failItem = 'data';
    else if (fieldName && !cmdParams.fieldName) failItem = 'fieldName';
    if (failItem) {
      return Error(
        `Command called with missing required parameter '${failItem}'`
      );
    }
  };

  /**
   * Return the DB object matching the requested name, if no dbName is passed, take the first DB in list
   * @param dbName Name of database
   * @returns {Db} Database object
   */
  private getDB = (dbName: string): Db => {
    if (dbName) {
      const obj = this.dbList.find((val) => val.name === dbName);
      if (obj) return obj.db;
      throw Error(
        `Attempted to access a non-initialise database. Did you include the database '${dbName}' when connecting to MongoDB?`
      );
    } else {
      return this.dbList[0].db;
    }
  };

  /**
   * Retrieve a list of database objects based on the caller's parameters
   * @param client MongoDB client
   * @param dbList Array of database names
   * @param dbOptions Array of database connection options
   * @returns Array of MongoDBListInterface objects
   */
  private getDBList = (
    client: MongoClient,
    dbList: string[],
    dbOptions: MongoClientCommonOption[]
  ): MongoDBListInterface[] => {
    const dbListObj: MongoDBListInterface[] = [];

    /* Atleast one database must be specified */
    if (!dbList || dbList.length === 0) {
      throw Error(
        'Attempted to connect to MongoDB without a specified database. Ensure atleast one database has been specified.'
      );
    }

    /* Initialise database for each request in list */
    for (let i = 0; i < dbList.length; i++) {
      if (dbOptions && dbOptions.length >= i + 1) {
        dbListObj.push({
          name: dbList[i],
          db: client.db(dbList[i], dbOptions[i]),
        });
      } else
        dbListObj.push({
          name: dbList[i],
          db: client.db(dbList[i]),
        });

      /* Ensure the da */
      if (!dbListObj[i] || !dbListObj[i].db) {
        throw Error(
          `Failed to establish a database connection to ${dbList[i]}`
        );
      }
    }

    return dbListObj;
  };

  /**
   * Confirm a connection to the DB has been made. Throws an error if no connection exists.
   */
  private checkConnectionActive = () => {
    if (!this.dbClientObj)
      throw Error(
        'Attempted to access Mongo DB database before connection has been established? Have you called MongoDBHandler.connect()?'
      );
  };

  /**
   * Attempt to establish a connection to the MongoDB database
   * @returns Success
   */
  connect = (): Promise<boolean> =>
    new Promise((resolve, reject) => {
      /* Destructure Interface */
      const {
        connectionDomain,
        connectionOptions,
        dbNameList,
        dbListOptions,
      } = this.dbObj;

      /* Attempt to connect to the MongoDB, returns success in promise */
      MongoClient.connect(
        connectionDomain,
        connectionOptions,
        (err, client) => {
          if (err) {
            reject(err);
            return;
          }

          /* Retrieve database objects for all requests databases */
          this.dbList = this.getDBList(client, dbNameList, dbListOptions);

          /* Store the client object under the class */
          this.dbClientObj = client;

          if (this.dbClientObj) resolve(true);
          else resolve(false);
        }
      );
    });

  disconnect = (): boolean => {
    if (this.dbClientObj) {
      this.dbClientObj.close();
      this.dbClientObj = null;
      return true;
    } else {
      return false;
    }
  };

  /**
   * Retrieve a single data item from the request database collection based on a provided query
   *
   * If multiple items match the query, the first instance will be returned
   *
   * @param commandArgs Command arguments, CollectionName and Query are required
   * @returns Returned data item || null
   */
  getDataItem = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = this.validateCommandParamPresence(
        commandArgs /* Command arguments */,
        false /* Database name required */,
        true /* Collection name required */,
        true /* Query required */,
        false /* Data required */
      );

      if (err) reject(err);

      const { dbName, collectionName, query } = commandArgs;

      this.checkConnectionActive();

      const collectionData = this.getDB(dbName).collection(collectionName);

      if (collectionData) {
        collectionData.findOne(query, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          if (result) {
            resolve(result);
          }
          resolve(null);
        });
      } else resolve(null);
    });

  /**
   * Input a single data item into the collection
   *
   * @param commandArgs Command arguments, CollectionName and Data are required
   * @returns Created data item || null
   */
  addDataItem = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = this.validateCommandParamPresence(
        commandArgs /* Command arguments */,
        false /* Database name required */,
        true /* Collection name required */,
        false /* Query required */,
        true /* Data required */
      );

      if (err) reject(err);

      const { dbName, collectionName, data } = commandArgs;

      this.checkConnectionActive();

      const collectionData = this.getDB(dbName).collection(collectionName);

      if (collectionData) {
        collectionData
          .insertOne(data)
          .then((dataItem) => {
            resolve(dataItem);
          })
          .catch((e) => {
            reject(e);
          });
      } else resolve(null);
    });

  /**
   * Update a single data item in the collection
   *
   * @param commandArgs Command arguments, CollectionName, Query and Data are required
   * @returns Modified data item || null
   */
  appendDataItem = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = this.validateCommandParamPresence(
        commandArgs /* Command arguments */,
        false /* Database name required */,
        false /* Collection name required */,
        false /* Query required */,
        true /* Data required */
      );

      if (err) reject(err);

      const { dbName, collectionName, query, data } = commandArgs;

      this.checkConnectionActive();

      const collectionData = this.getDB(dbName).collection(collectionName);

      if (collectionData) {
        collectionData
          .updateOne(query, { $set: data })
          .then((dataItem) => {
            resolve(dataItem);
          })
          .catch((e) => reject(e));
      } else resolve(null);
    });

  /**
   * Return's a list of values with key identifiers matching that as defined in fieldName
   *
   * @param commandArgs Command arguments, CollectionName & FieldName are required
   * @returns Value list || null
   */
  getFieldList = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = this.validateCommandParamPresence(
        commandArgs /* Command arguments */,
        false /* Database name required */,
        true /* Collection name required */,
        true /* Query required */,
        true /* Data required */,
        true /* Field name required */
      );

      if (err) reject(err);

      const { dbName, collectionName, fieldName } = commandArgs;

      this.checkConnectionActive();

      const collectionData = this.getDB(dbName).collection(collectionName);

      if (collectionData) {
        collectionData.distinct(fieldName, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          if (result && Array.isArray(result)) {
            const resultArr: any[] = [];

            for (let n = 0; n < result.length; n++) resultArr.push(result[n]);
            resolve(resultArr);
          } else resolve(null);
        });
      } else resolve(null);
    });

  /**
   * Delete a single item matching the provided query
   *
   * @param commandArgs Command arguments, CollectionName & Query are required
   * @returns Success result (typically boolean) || null
   */
  deleteItemSingle = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = this.validateCommandParamPresence(
        commandArgs /* Command arguments */,
        false /* Database name required */,
        true /* Collection name required */,
        true /* Query required */,
        false /* Data required */,
        false /* Field name required */
      );

      if (err) reject(err);

      const { dbName, collectionName, query } = commandArgs;

      this.checkConnectionActive();

      const collectionData = this.getDB(dbName).collection(collectionName);

      if (collectionData) {
        collectionData.deleteOne(query, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      } else resolve(null);
    });

  /**
   * Delete all items matching the provided query
   *
   * @param commandArgs Command arguments, CollectionName & Query are required
   * @returns Success result (typically boolean) || null
   */
  deleteItemMany = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = this.validateCommandParamPresence(
        commandArgs /* Command arguments */,
        false /* Database name required */,
        true /* Collection name required */,
        true /* Query required */,
        false /* Data required */,
        false /* Field name required */
      );

      if (err) reject(err);

      const { dbName, collectionName, query } = commandArgs;

      this.checkConnectionActive();

      const collectionData = this.getDB(dbName).collection(collectionName);

      if (collectionData) {
        collectionData.deleteMany(query, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      } else resolve(null);
    });
}
