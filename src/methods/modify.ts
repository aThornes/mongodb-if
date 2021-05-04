import { FilterQuery } from 'mongodb';

export const modifyDataItemSingle = (
  collectionData: any,
  query: FilterQuery,
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
