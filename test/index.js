const { MongoDBHandler } = require('../dist/index');

/**
 * Test used to confirm if the mongo database is interacted with properly for MongoDBHandler functions
 *
 * Not used as a unit test (jest test) since a database is required.
 *
 */

const handlerOptions = {
  connectionDomain: 'mongodb://127.0.0.1:27017',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  dbNameList: ['TestDB', 'other'],
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
      console.log(`Succesfully added data item with id ${dataItem.insertedId}`);
    })
    .catch((e) => console.error(e));

  /* Get the number of items in the DB */
  await handler
    .countDataItems({ query: { collectionName } })
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

  const destExists = await handler.doesCollectionExist({
    collectionName: 'Test2Collection',
  });

  if (!destExists) {
    /* Rename the collection */
    await handler
      .renameCollection({ collectionName, fieldName: 'Test2Collection' })
      .then((val) =>
        console.log(
          `${val ? 'Succesfully renamed' : 'Failed to rename'} the collection`
        )
      )
      .catch((e) => console.error(e));
  } else {
    console.log('Could not rename since Test2Collection already exists');
  }

  /* Create a new capped collection */
  const colExists = await handler.doesCollectionExist({
    collectionName: 'cappedCollection',
  });

  if (!colExists) {
    await handler
      .createCollection({
        collectionName: 'cappedCollection',
        options: {
          capped: true,
          size: 1028,
          max: 40,
        },
      })
      .then((val) => {
        console.log(
          `${val ? 'Succesfully created' : 'Failed to create'} the collection`
        );
      });
  } else {
    console.log("Could not create since 'capped collection' already exists");
  }

  const curDate = new Date();

  /* Add records to the collection */
  await handler
    .addMultipleDataItems({
      collectionName: 'cappedCollection',
      data: [
        { name: 'test1', timestamp: curDate },
        { name: 'test2', timestamp: new Date(curDate.getTime() + 1000) },
        { name: 'test3', timestamp: new Date(curDate.getTime() + 2000) },
        { name: 'test4', timestamp: new Date(curDate.getTime() + 3000) },
      ],
    })
    .then((val) => {
      console.log(
        `${val ? 'Succesfully added' : 'Failed to add'} the collection data`
      );
    });

  console.log('Getting many items');

  /* Get 3 most recent records */
  await handler
    .getDataItemsMany({
      collectionName: 'cappedCollection',
    })
    .then((resp) => {
      console.log('3 most recent records');

      /* Sort collection (newest first) */
      resp.sort((a, b) => {
        const x = a.timestamp;
        const y = b.timestamp;
        return x < y ? 1 : x > y ? -1 : 0;
      });

      /* Display first 3 */
      console.log(resp.slice(0, 3));
    });

  /* Drop the database */
  await handler.dropDatabase(handlerOptions.dbNameList[0]).then((success) => {
    console.log(`Drop database ${success ? 'successful' : 'failed'}`);
  });

  /* Attempt to drop a different database*/
  await handler.dropDatabase('admin').then((success) => {
    console.log(
      `Drop database ${
        success ? 'successful' : 'failed'
      } (note: 'fail' is expected here)`
    );
  });

  process.exit();
};

runTest();
