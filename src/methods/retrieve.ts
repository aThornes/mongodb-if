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
  fieldName: string | undefined
) =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData.distinct(fieldName, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        if (result && Array.isArray(result)) {
          const resultArr: any[] = [];

          for (let n = 0; n < result.length; n++) resultArr.push(result[n]);
          resolve(resultArr);
        } else resolve(null);
      });
    } else resolve(null);
  });
