export const createDataItem = (
  collectionData: any,
  data: any,
  options: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData
        .insertOne(data, options)
        .then((dataItem: any) => {
          resolve(dataItem);
        })
        .catch((e: any) => {
          reject(e);
        });
    } else resolve(null);
  });

export const createDataItemMany = (
  collectionData: any,
  data: any[],
  options: any
): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData
        .insertMany(data, options)
        .then((dataItem: any) => {
          resolve(dataItem);
        })
        .catch((e: any) => {
          reject(e);
        });
    } else resolve(null);
  });
