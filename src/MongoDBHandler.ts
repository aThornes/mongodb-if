import { Db, MongoClient } from 'mongodb';

import {
  MongoDBInterface,
  MongoDBListInterface,
  MongoDBCommandInterface,
} from './interfaces';

import { validateCommandParamPresence, getDBList } from './helperFunctions';

import { createDataItem } from './methods/create';
import {
  deleteDataItemSingle,
  deleteDataItemMany,
  dropFullCollection,
} from './methods/delete';
import { modifyDataItemSingle, renameCol } from './methods/modify';

import {
  countDocs,
  getCollectionOptions,
  getIndexList,
  isCollectionCapped,
  retrieveDataItem,
  retrieveFieldList,
} from './methods/retrieve';

/**
 * Required function level values
 *
 * Each bit refers to the interface MongoDBCommandInterface parameter
 * - If a pameter is required, 1 should be passed
 * - If not required, 0 should be passed
 */
const funcRequireVal = {
  getDataItem: 0x011000,
  addDataItem: 0x010100,
  appendDataItem: 0x010100,
  isCapped: 0x010000,
  countDataItems: 0x010000,
  getFieldList: 0x011110,
  deleteSingleItem: 0x011000,
  deleteItemMany: 0x011000,
  dropCollection: 0x010000,
  getIndices: 0x010000,
};
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

  /**
   * Get the collection object
   * @param commandArgs Caller command arguments
   * @returns Collection Object
   */
  private getCollectionData = (commandArgs: MongoDBCommandInterface): any => {
    const { dbName, collectionName } = commandArgs;

    this.checkConnectionActive();

    let useDB = dbName;

    if (!useDB && this.dbList && this.dbList[0]) {
      useDB = this.dbList[0].name;
    }

    if (!useDB) throw Error(`databaseName is null`);

    return this.getDB(useDB).collection(collectionName);
  };

  /**
   * Attempt to establish a connection to the MongoDB database
   * @see https://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html
   * @returns Success
   */
  connect = (): Promise<boolean> =>
    new Promise((resolve, reject) => {
      /* Destructure Interface */
      const { connectionDomain, connectionOptions, dbNameList, dbListOptions } =
        this.dbObj;

      if (!dbNameList) throw Error(`dbNameList cannot be ${dbNameList}`);

      /* Attempt to connect to the MongoDB, returns success in promise */
      MongoClient.connect(
        connectionDomain,
        connectionOptions,
        (err: any, client: MongoClient) => {
          if (err) {
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
   * @param commandArgs Command arguments, Required: CollectionName and Query
   * @returns {Promise<any>} Returned data item || null
   */
  getDataItem = (commandArgs: MongoDBCommandInterface): Promise<any> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.getDataItem
      );

      if (err) throw err;

      const collectionData = this.getCollectionData(commandArgs);

      retrieveDataItem(collectionData, commandArgs.query)
        .then((data) => resolve(data))
        .catch((e) => reject(e));
    });

  /**
   * Input a single data item into the collection
   *
   * @param commandArgs Command arguments, Required: collectionName and data, Optional: options
   * @returns {Promise<any>} Created data item || null
   */
  addDataItem = (commandArgs: MongoDBCommandInterface): Promise<any> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.addDataItem
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      createDataItem(collectionData, commandArgs.data, commandArgs.options)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Input multiple data items into the collection
   *
   * @param commandArgs Command arguments, Required: collectionName and data, Optional: options
   * @returns {Promise<any>} Created data items
   */
  addMultipleDataItems = (commandArgs: MongoDBCommandInterface): Promise<any> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.addDataItem
      );

      if (err) reject(err);

      if (!Array.isArray(commandArgs.data))
        throw Error(
          'Data items must be passed as an array, if you mean to submit a single item, please use .addDataItem() instead.'
        );

      const collectionData = this.getCollectionData(commandArgs);

      createDataItem(collectionData, commandArgs.data, commandArgs.options)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Update a single data item in the collection
   *
   * @param commandArgs Command arguments, Required: collectionName, query and Data, Optional: options
   * @returns {Promise<any>} Modified data item || null
   */
  modifyDataItem = (commandArgs: MongoDBCommandInterface): Promise<any> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.appendDataItem
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      const { query, data } = commandArgs;

      modifyDataItemSingle(collectionData, query, data)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Determine whether a collection is capped
   * @param commandArgs Command arguments, Required: collectionName, Optional: options
   * @returns {Promise<boolean>} isCapped
   */
  isCapped = (commandArgs: MongoDBCommandInterface): Promise<boolean> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.isCapped
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      isCollectionCapped(collectionData, commandArgs.options)
        .then((val) => {
          if (val) {
            resolve(true);
            return;
          }
          resolve(false);
        })
        .catch((e) => reject(e));
    });

  /**
   * Get the options of the collection
   * @param commandArgs Command arguments, Required: collectionName, Optional: options
   * @returns {Promise<any>} Collection options
   */
  getOptions = (commandArgs: MongoDBCommandInterface): Promise<boolean> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.isCapped
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      getCollectionOptions(collectionData, commandArgs.options)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Determine number of data items in the collection.
   * Pass the MongoDB FilterQuery object to count items only matching the data query.
   * Pass options argument to use optional settings, see options listed: https://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#countDocuments
   * @param commandArgs Command arguments, Required: collectionName & query, Optional: options
   * @returns {Promise<number>} Data item count (-1 if collection not found)
   */
  countDataItems = (commandArgs: MongoDBCommandInterface): Promise<number> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.countDataItems
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      const { query, options } = commandArgs;

      countDocs(collectionData, query, options)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Return's a list of values with key identifiers matching that as defined in fieldName
   *
   * @param commandArgs Command arguments, Required: collectionName & fieldName, Optional: options
   * @returns {Promise<any[]>} Value list || null
   */
  getFieldList = (commandArgs: MongoDBCommandInterface): Promise<any> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.getFieldList
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      retrieveFieldList(
        collectionData,
        commandArgs.fieldName,
        commandArgs.options
      )
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Returns an array that holds a list of documents that identify and describe the existing indexes on the collection
   * @param commandArgs Command arguments, Required: collectionName, Optional: options
   * @returns {Promise<any>} Index information
   */
  getIndexes = (commandArgs: MongoDBCommandInterface): Promise<string[]> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.getIndices
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      getIndexList(collectionData, commandArgs.fieldName)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Rename the requested collection
   * @param commandArgs Command arguments, Required: collectionName, fieldName (new collection name), Optional: options
   * @returns
   */
  renameCollection = (commandArgs: MongoDBCommandInterface): Promise<boolean> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.getIndices
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      const { fieldName, options } = commandArgs;

      renameCol(collectionData, fieldName, options)
        .then((val) => {
          if (val) {
            resolve(true);
            return;
          }
          resolve(false);
        })
        .catch((e) => reject(e));
    });

  /**
   * Delete a single item matching the provided query
   *
   * @param commandArgs Command arguments, Required: collectionName & query, Optional: options
   * @returns {Promise<boolean>} Success result (typically boolean) || null
   */
  deleteItemSingle = (commandArgs: MongoDBCommandInterface): Promise<any> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.deleteSingleItem
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      const { query, options } = commandArgs;

      deleteDataItemSingle(collectionData, query, options)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Delete all items matching the provided query
   *
   * @param commandArgs Command arguments, Required: collectionName & query, Optional: options
   * @returns {Promise<boolean>} Success result (typically boolean) || null
   */
  deleteItemMany = (commandArgs: MongoDBCommandInterface): Promise<any> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.deleteItemMany
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      const { query, options } = commandArgs;

      deleteDataItemMany(collectionData, query, options)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Drop the entire collection.
   * Optional - Pass optional settings, see https://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#drop
   * @param commandArgs Command arguments, Required: collectionName & query, Optional: options
   * @returns {Promise<boolean>} Success
   */
  dropCollection = (commandArgs: MongoDBCommandInterface): Promise<boolean> =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.dropCollection
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      dropFullCollection(collectionData, commandArgs.options)
        .then((val) => {
          if (val) resolve(true);
          else resolve(false);
        })
        .catch((e) => reject(e));
    });
}

export default MongoDBHandler;
