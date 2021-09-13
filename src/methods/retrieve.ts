import { Filter } from 'mongodb';

export const retrieveDataItem = (
  collectionData: any,
  query: Filter<any> | undefined
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.findOne(query, (err: any, result: any) => {
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

export const retrieveDataItemMany = (
  collectionData: any,
  query: Filter<any> | undefined
): Promise<any[] | null> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      try {
        const cursor = collectionData.find(query);
        if (cursor) {
          cursor.toArray().then((arr: any) => {
            resolve(arr);
          });
        } else resolve(null);
      } catch (e) {
        reject(e);
      }
    } else resolve(null);
  });

export const retrieveFieldList = (
  collectionData: any,
  fieldName: string | undefined,
  options: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.distinct(
        fieldName,
        null,
        options,
        (err: any, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result && Array.isArray(result)) {
            const resultArr: any[] = [];

            for (let n = 0; n < result.length; n++) resultArr.push(result[n]);
            resolve(resultArr);
          } else resolve(null);
        }
      );
    } else resolve(null);
  });

export const countDocs = (
  collectionData: any,
  query: Filter<any> | undefined,
  options: any
): Promise<number> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.countDocuments(
        query,
        options,
        (err: any, result: number) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        }
      );
    } else resolve(-1);
  });

export const getIndexList = (collectionData: any, options: any): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.indexes(options, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    } else resolve(null);
  });

export const isCollectionPresent = (
  databaseObject: any,
  collectionName: string
): boolean => {
  if (databaseObject) {
    const colFound = databaseObject.collection(collectionName);
    if (colFound) return true;
  }
  return false;
};

export const isCollectionCapped = (
  collectionData: any,
  options: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.isCapped(options, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    } else resolve(null);
  });

export const getCollectionOptions = (
  collectionData: any,
  options: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.options(options, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    } else resolve(null);
  });
