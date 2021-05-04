import { Db, MongoClient, MongoClientCommonOption } from 'mongodb';

import {
  MongoDBInterface,
  MongoDBListInterface,
  MongoDBCommandInterface,
} from './interfaces';

import { validateCommandParamPresence, getDBList } from './helperFunctions';

import { createDataItem } from './methods/create';
import { deleteDataItemSingle, deleteDataItemMany } from './methods/delete';
import { modifyDataItemSingle } from './methods/modify';

import { retrieveDataItem, retrieveFieldList } from './methods/retrieve';

/**
 * Required function level values
 *
 * Each bit refers to the interface MongoDBCommandInterface parameter
 * - If a pameter is required, 1 should be passed
 * - If not required, 0 should be passed
 */
const funcRequireVal = {
  getDataItem: 0x01100,
  addDataItem: 0x01010,
  appendDataItem: 0x00010,
  getFieldList: 0x01111,
  deleteSingleItem: 0x01100,
  deleteItemMany: 0x01100,
};

export class MongoDBHandler {
  dbClientObj: MongoClient | null;
  dbObj: MongoDBInterface;
  dbList: MongoDBListInterface[] | null;
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

    this.dbClientObj = null;
    this.dbList = null;
  }

  /**
   * Return the DB object matching the requested name, if no dbName is passed, take the first DB in list
   * @param dbName Name of database
   * @returns {Db} Database object
   */
  private getDB = (dbName: string): Db => {
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

    if (!dbName) throw Error(`dbName is null`);

    this.checkConnectionActive();

    return this.getDB(dbName).collection(collectionName);
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

      if (!dbListOptions) throw Error(`dbListOptions is null`);

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
          this.dbList = getDBList(client, dbNameList, dbListOptions);

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
   * Get the list of MongoDB databases. Contains DB name and DB data.
   * @returns MongoDBInterface array
   */
  getDatabaseObjectList = (): MongoDBListInterface[] | null => {
    return this.dbList;
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
   * @param commandArgs Command arguments, CollectionName and Data are required
   * @returns Created data item || null
   */
  addDataItem = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.addDataItem
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      createDataItem(collectionData, commandArgs.data)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Update a single data item in the collection
   *
   * @param commandArgs Command arguments, CollectionName, Query and Data are required
   * @returns Modified data item || null
   */
  appendDataItem = (commandArgs: MongoDBCommandInterface): any =>
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
   * Return's a list of values with key identifiers matching that as defined in fieldName
   *
   * @param commandArgs Command arguments, CollectionName & FieldName are required
   * @returns Value list || null
   */
  getFieldList = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.getFieldList
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      retrieveFieldList(collectionData, commandArgs.fieldName)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Delete a single item matching the provided query
   *
   * @param commandArgs Command arguments, CollectionName & Query are required
   * @returns Success result (typically boolean) || null
   */
  deleteItemSingle = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.deleteSingleItem
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      deleteDataItemSingle(collectionData, commandArgs.query)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });

  /**
   * Delete all items matching the provided query
   *
   * @param commandArgs Command arguments, CollectionName & Query are required
   * @returns Success result (typically boolean) || null
   */
  deleteItemMany = (commandArgs: MongoDBCommandInterface): any =>
    new Promise((resolve, reject) => {
      const err = validateCommandParamPresence(
        commandArgs /* Command arguments */,
        funcRequireVal.deleteItemMany
      );

      if (err) reject(err);

      const collectionData = this.getCollectionData(commandArgs);

      deleteDataItemMany(collectionData, commandArgs.query)
        .then((val) => resolve(val))
        .catch((e) => reject(e));
    });
}
