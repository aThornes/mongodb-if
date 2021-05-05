const MongoDBHandler = require('../dist/index');

const handlerOptions = {
  connectionDomain: 'mongodb://127.0.0.1:27017',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  dbNameList: ['TestDB'],
};

/* Instantiate Handler */
const handler = new MongoDBHandler(handlerOptions);

/* Connect to DB */
handler.connect().then((success) => {
  if (success) {
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
  handler
    .addDataItem({
      collectionName: 'TestCollection',
      data: { name: 'John Doe', height: '1.87m', dob: '12/03/1873' },
    })
    .then((dataItem) => {
      console.log('Succesfully added data item');
      console.log(dataItem);
      process.exit();
    });
});
