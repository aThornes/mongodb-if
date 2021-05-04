# MongoDB Database Interface

A simple MongoDB interface library built upon the [mongodb library](https://www.npmjs.com/package/mongodb)

## MongoDB Handler
### Initialise

The MongoDBHandler class is the core of the MongoDB interface, you can create the database interface instance using:

    const DBHandler = new MongoDBHandler({connectionDomain, connectionOptions, dbNameList, dbListOptions});
    
### Initialisation parameters

- `connectionDomain` refers to your MongoDB connection string, a typical connection string might be `mongodb://127.0.0.1:27017`
- `connectionOptions` refer to your MongoDB connection options which can be found under MongoDBClient documentation and are defined by the interface `MongoClientOptions`
- `dbNameList` is a string array containing the names of each database you wish to connect to.
- `dbListOptions` is a `MongoClientCommonOption` array containing the connection parameters for each database in `dbNameList`



Note: This is currently still work in progress and further information will be added shortly.
