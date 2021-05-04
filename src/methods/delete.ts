import { FilterQuery } from 'mongodb';

export const deleteDataItemSingle = (
  collectionData: any,
  query: FilterQuery<any> | undefined
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.deleteOne(query, (err: any, result: any) => {
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
  query: FilterQuery<any> | undefined
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.deleteMany(query, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    } else resolve(null);
  });
