import {
  MongoDBInterface,
  MongoDBListInterface,
  MongoDBCommandInterface,
} from './interfaces';

import { Db, MongoClient, MongoClientCommonOption } from 'mongodb';

/**
 * Validate the caller includes the required parameters
 */
export const validateCommandParamPresence = (
  cmdParams: MongoDBCommandInterface,
  validationVal: number
): Error | null => {
  let failItem = '';

  const { dbName, collectionName, query, data, fieldName } = cmdParams;

  if (dbName && validationVal | 0x10000) failItem = '\ndbName';
  if (collectionName && validationVal | 0x01000)
    failItem = '\ndbcollectionName';
  if (query && validationVal | 0x00100) failItem = '\nquery';
  if (data && validationVal | 0x10010) failItem = '\ndata';
  if (fieldName && validationVal | 0x10001) failItem = '\nfieldName';

  if (failItem.length > 0) {
    return Error(
      `Command called with missing required parameter '${failItem}'`
    );
  }
  return null;
};

/**
 * Retrieve a list of database objects based on the caller's parameters
 * @param client MongoDB client
 * @param dbList Array of database names
 * @param dbOptions Array of database connection options
 * @returns Array of MongoDBListInterface objects
 */
export const getDBList = (
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
      throw Error(`Failed to establish a database connection to ${dbList[i]}`);
    }
  }

  return dbListObj;
};
