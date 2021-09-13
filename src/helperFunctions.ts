import { DbOptions, MongoClient } from 'mongodb';
import { MongoDBCommandInterface, MongoDBListInterface } from './types';

const hasValue = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  return true;
};

const validation = {
  dbName: 0x100000,
  collectionName: 0x010000,
  query: 0x001000,
  data: 0x000100,
  fieldName: 0x000010,
  options: 0x000001,
};

const isValid = (value: any, validation: number, validationCheck: number) => {
  if (validation & validationCheck) {
    if (!hasValue(value)) return false;
  }
  return true;
};

/**
 * Validate the caller includes the required parameters
 */
export const validateCommandParamPresence = (
  cmdParams: MongoDBCommandInterface,
  validationVal: number
): Error | null => {
  let failItem = '';
  const { dbName, collectionName, query, data, fieldName } = cmdParams;

  if (!isValid(dbName, validationVal, validation.dbName)) failItem = '\ndbName';
  if (!isValid(collectionName, validationVal, validation.collectionName))
    failItem = '\ncollectionName';
  if (!isValid(query, validationVal, validation.query)) failItem = '\nquery';
  if (!isValid(data, validationVal, validation.data)) failItem = '\ndata';
  if (!isValid(fieldName, validationVal, validation.fieldName))
    failItem = '\nfieldName';

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
  dbOptions: DbOptions[]
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

    /* Ensure connection to DB was established */
    if (!dbListObj[i] || !dbListObj[i].db) {
      throw Error(`Failed to establish a database connection to ${dbList[i]}`);
    }
  }

  return dbListObj;
};

export const isNumeric = (n: any) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};
