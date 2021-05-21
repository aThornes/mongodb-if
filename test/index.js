const { MongoDBHandler } = require('../dist/index');

const handlerOptions = {
  connectionDomain: 'mongodb://127.0.0.1:27017',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  dbNameList: ['TestDB'],
  dbListOptions: [{ replicaSet: 'myRepl' }],
};

console.log(
  typeof handlerOptions.dbListOptions,
  Array.isArray(handlerOptions.dbListOptions)
);

const runTest = async () => {
  /* The name of our database collection within TestDB (Note if this does not exist, it will be automatically created when a data item is added!) */
  const collectionName = 'TestCollection';

  /* Instantiate Handler */
  const handler = new MongoDBHandler(handlerOptions);

  /* Connect to DB */
  const connected = await handler.connect();

  if (connected) {
    console.log(
      `Succesfully connected to MongoDB @ ${handlerOptions.connectionDomain}!`
    );
  } else {
    console.log(
      `Failed to connect to MongoDB @ ${handlerOptions.connectionDomain}!`
    );
    process.exit();
  }

  /* Add an item to the DB */
  await handler
    .addDataItem({
      collectionName,
      data: { name: 'John Doe', height: '1.87m', dob: '12/03/1873' },
    })
    .then((dataItem) => {
      console.log('Succesfully added data item');
      console.log(dataItem.ops);
    })
    .catch((e) => console.error(e));

  /* Get the number of items in the DB */
  await handler
    .countDataItems({ collectionName })
    .then((val) => console.log(`${val} data items found in ${collectionName}`))
    .catch((e) => console.error(e));

  /* Get a list of all names in DB */
  await handler
    .getFieldList({ collectionName, fieldName: 'name' })
    .then((val) => console.log(val))
    .catch((e) => console.error(e));

  /* Drop the collection */
  // await handler
  //   .dropCollection({ collectionName })
  //   .then((val) => {
  //     if (val) console.log(`${collectionName} succesfully dropped`);
  //     else console.log(`${collectionName} failed to be deleted`);
  //   })
  //   .catch((e) => console.error(e));

  /* Get all indices from the collection */
  await handler
    .getIndexes({ collectionName })
    .then((val) => console.log(val))
    .catch((e) => console.error(e));

  /* Check if the collection is capped */
  await handler
    .isCapped({ collectionName })
    .then((val) => console.log(`The collection is ${!val ? 'not ' : ''}capped`))
    .catch((e) => console.error(e));

  /* Get options for the collection */
  console.log('Collection options:');
  await handler
    .getOptions({ collectionName })
    .then((val) => console.log(val))
    .catch((e) => console.error(e));

  /* Rename the collection */
  await handler
    .renameCollection({ collectionName, fieldName: 'Test2Collection' })
    .then((val) =>
      console.log(
        `${val ? 'Succesfully renamed' : 'Failed to rename'} the collection`
      )
    )
    .catch((e) => console.error(e));

  process.exit();
};

runTest();
