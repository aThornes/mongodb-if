import { FilterQuery } from 'mongodb';

export const retrieveDataItem = (
  collectionData: any,
  query: FilterQuery<any> | undefined
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
  query: FilterQuery<any> | undefined,
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
