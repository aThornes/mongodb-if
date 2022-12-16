import { Db, MongoClient } from 'mongodb';

import { getDBList } from './helperFunctions';

import {
  createDataItem,
  createDataItemMany,
  newCollection,
} from './methods/create';
import {
  deleteDataItemSingle,
  deleteDataItemMany,
  dropFullCollection,
} from './methods/delete';

import {
  modifyDataItemSingle,
  modifyDataItemsMany,
  renameCol,
} from './methods/modify';

import {
  countDocs,
  getCollectionOptions,
  getIndexList,
  isCollectionCapped,
  isCollectionPresent,
  retrieveDataItem,
  retrieveDataItemMany,
  retrieveFieldList,
} from './methods/retrieve';

import {
  HandlerAddItem,
  HandlerAddItemMultiple,
  HandlerBaseRequest,
  HandlerCountItems,
  HandlerDeleteItem,
  HandlerEditItem,
  HandlerGetCollection,
  HandlerGetFieldList,
  HandlerGetindices,
  HandlerGetItemMany,
  HandlerGetItemSingle,
  HandlerGetName,
  HandlerGetOptions,
  HandlerIsCapped,
  HandlerModifyCollection,
  HandlerRenameColleciton,
  MongoDBInterface,
  MongoDBListInterface,
} from './types';

class MongoDBHandler {
  dbClientObj: MongoClient | null;
  dbObj: MongoDBInterface;
  dbList: MongoDBListInterface[] | null;
  /**
   * Mongo Database Interface Handler - Handles all data communication between application and the MongoDB database
   * @param {MongoDBInterface} MongoData Connection Options
   */
  constructor(MongoData: MongoDBInterface) {
    const { connectionDomain, connectionOptions, dbNameList, dbListOptions } =
      MongoData;

    /* Required domain, can include authentication params such e.g. admin:password@mongodb://127.0.0.1:27017 */
    if (!connectionDomain)
      throw Error(`connectionDomain cannot be ${connectionDomain}`);

    /* Atleast one database must be specified in the array */
    if (!Array.isArray(dbNameList) || dbNameList.length === 0)
      throw Error(`dbNameList must be an array and contain atleast one value`);

    if (dbListOptions && !Array.isArray(dbListOptions))
      throw Error(`dbListOptions must be an array`);

    this.dbObj = {
      connectionDomain,
      dbNameList,
      connectionOptions,
      dbListOptions,
    };

    this.dbClientObj = null;
    this.dbList = null;
  }

  /**
   * Return the DB object matching the requested name, if no dbName is passed, take the first DB in list
   * @param dbName Name of database
   * @returns {Db} Database object
   */
  private getDB = (dbName?: string): Db => {
    if (!this.dbList) throw Error(`dbList is null`);
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
   * Confirm a connection to the DB has been made. Throws an error if no connection exists.
   */
  private checkConnectionActive = () => {
    if (!this.dbClientObj)
      throw Error(
        'Attempted to access Mongo DB database before connection has been established? Have you called MongoDBHandler.connect()?'
      );
  };

  private getDBName = ({ dbName }: HandlerGetName): string => {
    this.checkConnectionActive();

    let useDB = dbName;

    if (!useDB && this.dbList && this.dbList[0]) {
      useDB = this.dbList[0].name;
    }

    if (!useDB) throw Error(`databaseName is null`);

    return useDB;
  };

  /**
   * Get the collection object
   * @param commandArgs Caller command arguments
   * @returns Collection Object
   */
  private getCollectionData = ({
    dbName,
    collectionName,
  }: HandlerGetCollection) => {
    const useDB = this.getDBName({ dbName });

    return this.getDB(useDB).collection(collectionName);
  };

  /**
   * Get the database object
   * @param commandArgs Caller command arguments
   * @returns Collection Object
   */
  private getLocalDBObject = ({ dbName }: HandlerGetName): any => {
    const useDB = this.getDBName({ dbName });

    return this.getDB(useDB);
  };

  /**
   * Attempt to establish a connection to the MongoDB database
   * @see https://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html
   * @returns Success
   */
  connect = async (): Promise<boolean> =>
    new Promise((resolve, reject) => {
      /* Destructure Interface */
      const { connectionDomain, connectionOptions, dbNameList, dbListOptions } =
        this.dbObj;

      if (!dbNameList) throw Error(`dbNameList cannot be ${dbNameList}`);

      /* Attempt to connect to the MongoDB, returns success in promise */
      MongoClient.connect(
        connectionDomain,
        connectionOptions,
        (err, client) => {
          if (err || client === undefined) {
            reject(err);
            return;
          }

          /* Retrieve database objects for all requests databases */
          this.dbList = getDBList(client, dbNameList, dbListOptions || []);

          /* Store the client object under the class */
          this.dbClientObj = client;

          if (this.dbClientObj) {
            resolve(true);
          } else resolve(false);
        }
      );
    });

  /**
   * Close database connection
   * @returns Success
   */
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
   * Get the list of MongoDB databases. Contains DB name and DB data.
   * @returns MongoDBInterface array
   */
  getDatabaseObjectList = (): MongoDBListInterface[] | null => {
    return this.dbList;
  };

  /**
   * Return the MongoDB Client Object.
   * Typically used for MongoDB commands that are not supported under this library.
   *
   * However rising an issue or a pull request for additional functionality would be appreciated to
   * improve this library.
   * @returns MongoClient object (or null if not instantiated)
   */
  getDatabaseClient = (): MongoClient | null => {
    return this.dbClientObj;
  };

  /**
   * Return the database object.
   * Typically used for MongoDB commands that are not supported under this library.
   *
   * However rising an issue or a pull request for additional functionality would be appreciated to
   * improve this library.
   * @param databaseName Name of the database (if no value is provided, the first (or only) in list will be returned )
   * @returns Database object
   */
  getDatabaseObject = (databaseName?: string): Db | null => {
    try {
      return this.getDB(databaseName);
    } catch {
      return null;
    }
  };

  /**
   * Retrieve a single data item from the request database collection based on a provided query
   *
   * If multiple items match the query, the first instance will be returned
   *
   * @returns {Promise<any>} Returned data item || null
   */
  getDataItem = ({
    query,
    dbName,
    collectionName,
  }: HandlerGetItemSingle): Promise<any> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return retrieveDataItem(collectionData, query);
  };

  /**
   * Retrieve multiple datas item from the request database collection based on a provided query
   *
   * @returns {Promise<any>} Returned data item || null
   */
  getDataItemsMany = ({
    dbName,
    collectionName,
    query,
    sort,
    skip,
    limit,
  }: HandlerGetItemMany): Promise<any[] | null> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return retrieveDataItemMany({
      collectionData,
      query,
      sortQuery: sort,
      limit,
      skip,
    });
  };

  /**
   * Input a single data item into the collection
   *
   * @returns {Promise<any>} Created data item || null
   */
  addDataItem = ({
    dbName,
    collectionName,
    data,
    options,
  }: HandlerAddItem): Promise<any> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return createDataItem(collectionData, data, options);
  };

  /**
   * Input multiple data items into the collection
   *
   * @returns {Promise<any>} Created data items
   */
  addMultipleDataItems = ({
    dbName,
    collectionName,
    data,
    options,
  }: HandlerAddItemMultiple): Promise<any> => {
    if (!Array.isArray(data))
      throw Error(
        'Data items must be passed as an array, if you mean to submit a single item, please use .addDataItem() instead.'
      );

    const collectionData = this.getCollectionData({ dbName, collectionName });

    return createDataItemMany(collectionData, data, options);
  };

  /**
   * Update a single data item in the collection
   *
   * @returns {Promise<any>} Modified data item || null
   */
  modifyDataItem = ({
    dbName,
    collectionName,
    query,
    data,
  }: HandlerEditItem): Promise<any> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return modifyDataItemSingle(collectionData, query, data);
  };

  /**
   * Update a multiple data item in the collection
   *
   * @returns {Promise<any[]>} Modified data item array || null
   */
  modifyDataItemsMany = ({
    dbName,
    collectionName,
    query,
    data,
  }: HandlerEditItem): Promise<any> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return modifyDataItemsMany(collectionData, query, data);
  };

  /**
   * Determine whether a collection is capped
   * @returns {Promise<boolean>} isCapped
   */
  isCapped = async ({
    dbName,
    collectionName,
    options,
  }: HandlerIsCapped): Promise<boolean> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    const isCapped = await isCollectionCapped(collectionData, options);

    if (isCapped) return true;
    return false;
  };

  /**
   * Get the options of the collection
   * @returns {Promise<any>} Collection options
   */
  getOptions = ({
    dbName,
    collectionName,
    options,
  }: HandlerGetOptions): Promise<boolean> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return getCollectionOptions(collectionData, options);
  };

  /**
   * Determine number of data items in the collection.
   * Pass the MongoDB FilterQuery object to count items only matching the data query.
   * Pass options argument to use optional settings, see options listed: https://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#countDocuments
   * @param commandArgs Command arguments, Required: collectionName, Optional: query & options
   * @returns {Promise<number>} Data item count (-1 if collection not found)
   */
  countDataItems = ({
    dbName,
    collectionName,
    query,
    options,
  }: HandlerCountItems): Promise<number> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return countDocs(collectionData, query, options);
  };

  /**
   * Return's a list of values with key identifiers matching that as defined in fieldName
   *
   * @returns {Promise<any[]>} Value list || null
   */
  getFieldList = ({
    dbName,
    collectionName,
    query,
    fieldName,
    options,
  }: HandlerGetFieldList): Promise<any> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return retrieveFieldList(
      collectionData,
      fieldName as keyof Document,
      query || {},
      options
    );
  };

  /**
   * @deprecated Since version 1.4. Will be deleted in version 2.0. Please use getIndices()
   */
  getIndexes = (params: HandlerGetindices) => this.getIndices(params);

  /**
   * Returns an array that holds a list of documents that identify and describe the existing indexes on the collection
   * @returns {Promise<any>} Index information
   */
  getIndices = ({
    dbName,
    collectionName,
    fieldName,
  }: HandlerGetindices): Promise<string[]> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return getIndexList(collectionData, fieldName);
  };

  /**
   * Rename the requested collection
   * @returns
   */
  renameCollection = async ({
    dbName,
    collectionName,
    fieldName,
    options,
  }: HandlerRenameColleciton): Promise<boolean> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    const resp = await renameCol(collectionData, fieldName, options);

    if (resp) return true;
    return false;
  };

  /**
   * Delete a single item matching the provided query
   *
   * @returns {Promise<boolean>} Success result (typically boolean) || null
   */
  deleteItemSingle = ({
    dbName,
    collectionName,
    query,
    options,
  }: HandlerDeleteItem): Promise<any> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return deleteDataItemSingle(collectionData, query, options);
  };
  /**
   * Delete all items matching the provided query
   *
   * @returns {Promise<boolean>} Success result (typically boolean) || null
   */
  deleteItemMany = ({
    dbName,
    collectionName,
    query,
    options,
  }: HandlerDeleteItem): Promise<any> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    return deleteDataItemMany(collectionData, query, options);
  };

  /**
   * Returns if a collection exists
   * @returns {Promise<boolean>} Success
   */
  doesCollectionExist = ({
    dbName,
    collectionName,
  }: HandlerBaseRequest): boolean => {
    const databaseObject = this.getLocalDBObject({ dbName });

    return isCollectionPresent(databaseObject, collectionName);
  };

  /**
   * Create a new collection
   * Optional - Pass optional settings, see https://mongodb.github.io/node-mongodb-native/3.1/api/Db.html#createCollection
   * @returns {Promise<boolean>} Success
   */
  createCollection = async ({
    dbName,
    collectionName,
    options,
  }: HandlerModifyCollection): Promise<boolean> => {
    const databaseObject = this.getLocalDBObject({ dbName });

    const resp = await newCollection(databaseObject, collectionName, options);

    if (resp) return true;
    return false;
  };

  /**
   * Drop the entire collection.
   * Optional - Pass optional settings, see https://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#drop
   * @returns {Promise<boolean>} Success
   */
  dropCollection = async ({
    dbName,
    collectionName,
    options,
  }: HandlerModifyCollection): Promise<boolean> => {
    const collectionData = this.getCollectionData({ dbName, collectionName });

    const resp = await dropFullCollection(collectionData, options);

    if (resp) return true;
    return false;
  };

  /**
   * Drop a database
   * @param databaseName
   * @returns {Promise<boolean>} Success
   */
  dropDatabase = (databaseName: string): Promise<boolean> =>
    new Promise((resolve) => {
      // Database name is required
      if (!databaseName) resolve(false);

      // Can only delete databases defined in the handler
      if (!this.dbObj.dbNameList.includes(databaseName)) resolve(false);

      const db = this.getDB(databaseName);

      if (db) {
        db.dropDatabase().then((success) => {
          if (success) resolve(true);
          else resolve(false);
        });
      } else resolve(false);
    });
}

export default MongoDBHandler;
