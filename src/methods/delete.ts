import { FilterQuery } from 'mongodb';

export const deleteDataItemSingle = (
  collectionData: any,
  query: FilterQuery<any> | undefined,
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
  query: FilterQuery<any> | undefined,
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

export const dropFullCollection = (collectionData: any, options: any) =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      let passOptions = options;
      /* Session is only viable option (https://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#drop)*/
      if (options && !options.session) passOptions = null;

      collectionData.drop(options, (err: any, result: any) => {
        if (err) reject(err);
        resolve(result);
      });
    } else resolve(null);
  });
