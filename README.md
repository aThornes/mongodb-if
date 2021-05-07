# MongoDB Database Interface

A simple MongoDB interface library built upon the [mongodb library](https://www.npmjs.com/package/mongodb)

[![npm](https://img.shields.io/npm/v/mongodb-if?color=red)](https://www.npmjs.com/package/mongodb-if)
[![npm bundle size](https://img.shields.io/bundlephobia/min/mongodb-if)](https://www.npmjs.com/package/mongodb-if)
[![npm downloads](https://img.shields.io/npm/dt/mongodb-if?color=blue)](https://www.npmjs.com/package/mongodb-if)

## Initialise

The MongoDBHandler class is the core of the MongoDB interface, you can create the database interface instance using:

    const DBHandler = MongoDBHandler({connectionDomain, connectionOptions, dbNameList, dbListOptions});

or

    const handlerOptions: MongoDBInterface = {
      connectionDomain: 'mongodb://127.0.0.1:27017',
      connectionOptions: {
        ...
      },
      dbNameList: ['DB1', 'DB2'],
      dbListOptions: [{ replicaSet: 'myRepl' }],

    const DBHandler = MongoDBHandler(MongoDBInterface);

## Initialisation parameters

- `connectionDomain` refers to your MongoDB connection string, a typical connection string might be `mongodb://127.0.0.1:27017`
- `connectionOptions` refer to your MongoDB connection options which can be found under MongoDBClient documentation and are defined by the interface `MongoClientOptions`
- `dbNameList` is a string array containing the names of each database you wish to connect to.
- `dbListOptions` is a `MongoClientCommonOption` array containing the connection parameters for each database in `dbNameList` (see [Connection string options](https://docs.mongodb.com/manual/reference/connection-string/#std-label-connections-connection-options)

## Available Functions

All the following command have the optional argument `dbName` (note: if this is not provided, the first (or only) database in list will be selected)

### connect()

Establish a connection to each of the requested databases
Returns Promise<boolean> Success

### disconnect()

Close a connection to all databases
Returns boolean Success

### getDatabaseObjectList() :MongoDBListInterface[]

Get the list of associated databases, includes name and database object
Returns MongoDBListInterface[] Database list

### getDatabaseClient

Return the MongoDB Client Object. Typically used for MongoDB commands that are not supported under this library (however issues and PRs are appreciated)

### getDatabaseObject

Return a MongoDB Database Object. Typically used for MongoDB commands that are not supported under this library (however issues and PRs are appreciated)

### getDataItem(MongoDBCommandInterface)

Retrieve a data item, Command arguments, Required: `collectionName` and `Query`

### addDataItem(MongoDBCommandInterface)

Add a data item, Command arguments, Required: `collectionName` and `data`, Optional: `options`

### addMultipleDataItems(MongoDBCommandInterface)

Add multiple data items, Command arguments, Required: `collectionName` and `data`, Optional: `options`

### modifyDataItem(MongoDBCommandInterface)

Append to a data item, Command arguments, Required: `collectionName`, `query` and `Data`, Optional: `options`

### countDataItems(MongoDBCommandInterface)

Determine number of data items in the database collection, Command arguments, Required: `collectionName` & `query`, Optional: `options`

### isCapped(MongoDBCommandInterface)

Returns whether the collection is capped or not, Command arguments, Required: `collectionName`, Optional: `options`

### getOptions(MongoDBCommandInterface)

Returns collection options, Command arguments, Required: `collectionName`, Optional: `options`

### getFieldList(MongoDBCommandInterface)

Retrieve every value with the matching field (database key) as a list, Command arguments, Required: `collectionName` & `fieldName`, Optional: `options`

### getIndexes(MongoDBCommandInterface)

Returns an array that holds a list of documents that identify and describe the existing indexes on the collection, Command arguments, Required: `collectionName`, Optional: `options`

### renameCollection(MongoDBCommandInterface)

Rename a collection Command arguments, Required: `collectionName`, `fieldName` (new collection name), Optional: `options`

### deleteItemSingle(MongoDBCommandInterface)

Delete a single item as defined by the passed query, Command arguments, Required: `collectionName` & `query`, Optional: `options`

### deleteItemMany(MongoDBCommandInterface)

Delete all items matching the passed query, Command arguments, Required: `collectionName` & `query`, Optional: `options`

### dropCollection(MongoDBCommandInterface)

Drop the entire collection, Command arguments, Required: `collectionName` & `query`, Optional: `options`

## Exported Interfaces

- MongoDBInterface : Used to initialise the MongoDB handler
- MongoDBListInterface : Stores information about each database
- MongoDBCommandInterface : Used to pass MongoDB command parmeters

## Examples

See [Library Test](https://github.com/aThornes/mongodb-if/tree/master/test) for some basic usage examples.
