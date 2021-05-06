import { FilterQuery } from 'mongodb';

export const modifyDataItemSingle = (
  collectionData: any,
  query: FilterQuery<any> | undefined,
  data: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData
        .updateOne(query, { $set: data })
        .then((dataItem: any) => {
          resolve(dataItem);
        })
        .catch((e: any) => reject(e));
    } else resolve(null);
  });

export const renameCol = (
  collectionData: any,
  field: string | undefined,
  options: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData || !field) {
      collectionData
        .rename(field, options)
        .then((success: any) => {
          resolve(success);
        })
        .catch((e: any) => reject(e));
    } else resolve(null);
  });
