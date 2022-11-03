import { CommandOperationOptions, Filter } from 'mongodb';

export const deleteDataItemSingle = (
  collectionData: any,
  query: Filter<any> | undefined,
  options: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.deleteOne(query, options, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    } else resolve(null);
  });

export const deleteDataItemMany = (
  collectionData: any,
  query: Filter<any> | undefined,
  options: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.deleteMany(query, options, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    } else resolve(null);
  });

export const dropFullCollection = (
  collectionData: any,
  options?: Record<string, any>
) =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      /* https://mongodb.github.io/node-mongodb-native/4.0/classes/collection.html#drop */

      collectionData.drop(options, (err: any, result: any) => {
        if (err) reject(err);
        resolve(result);
      });
    } else resolve(null);
  });
