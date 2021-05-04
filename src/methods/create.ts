export const createDataItem = (collectionData: any, data: any): Promise<any> =>
  new Promise((resolve, reject) => {
    if (collectionData) {
      collectionData
        .insertOne(data)
        .then((dataItem: any) => {
          resolve(dataItem);
        })
        .catch((e: any) => {
          reject(e);
        });
    } else resolve(null);
  });
