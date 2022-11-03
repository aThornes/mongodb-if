# MongoDB Database Interface

A simple MongoDB interface library built upon the [mongodb library](https://www.npmjs.com/package/mongodb)

[![npm](https://img.shields.io/npm/v/mongodb-if?color=red)](https://www.npmjs.com/package/mongodb-if)
[![npm bundle size](https://img.shields.io/bundlephobia/min/mongodb-if)](https://www.npmjs.com/package/mongodb-if)
[![npm downloads](https://img.shields.io/npm/dt/mongodb-if?color=blue)](https://www.npmjs.com/package/mongodb-if)

## Import

    import { MongoDBHandler } from 'mongodb-if'

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

    const DBHandler = MongoDBHandler(handlerOptions);

## Initialisation parameters

- `connectionDomain` refers to your MongoDB connection string, a typical connection string might be `mongodb://127.0.0.1:27017`
- `connectionOptions` refer to your MongoDB connection options which can be found under MongoDBClient documentation and are defined by the interface `MongoClientOptions`
- `dbNameList` is a string array containing the names of each database you wish to connect to.
- `dbListOptions` is a `MongoClientCommonOption` array containing the connection parameters for each database in `dbNameList` (see [Connection string options](https://docs.mongodb.com/manual/reference/connection-string/#std-label-connections-connection-options))

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

### getDatabaseClient()

Return the MongoDB Client Object. Typically used for MongoDB commands that are not supported under this library (however issues and PRs are appreciated)

### getDatabaseObject(string)

Return a MongoDB Database Object. Typically used for MongoDB commands that are not supported under this library (however issues and PRs are appreciated)

### getDataItem(HandlerGetItemSingle)

Retrieve a data item, Command arguments, Required: `collectionName` and `Query`

### getDataItemsMany(HandlerGetItemMany)

Retrieve multiple data items, Command arguments, Required: `collectionName`, Optional: `Query`, `limit`, `skip`, `sort`

- limit: Pass a number to restrict number of items retrieved
- skip: Pass a number to skip to first x matching results
- Sort: Pass an object for a field to sort by, use `1` for ascending, `-1` for descending. E.g. `{ age: 1 }`

### addDataItem(HandlerAddItem)

Add a data item, Command arguments, Required: `collectionName` and `data`, Optional: `options`

### addMultipleDataItems(HandlerAddItemMultiple)

Add multiple data items, Command arguments, Required: `collectionName` and `data`, Optional: `options`

### modifyDataItem(HandlerEditItem)

Append to a data item, Command arguments, Required: `collectionName`, `query` and `Data`, Optional: `options`

### countDataItems(HandlerCountItems)

Determine number of data items in the database collection, Command arguments, Required: `collectionName`, Optional: `query` & `options`

### isCapped(HandlerIsCapped)

Returns whether the collection is capped or not, Command arguments, Required: `collectionName`, Optional: `options`

### getOptions(HandlerGetOptions)

Returns collection options, Command arguments, Required: `collectionName`, Optional: `options`

### getFieldList(HandlerGetFieldList)

Retrieve every value with the matching field (database key) as a list, Command arguments, Required: `collectionName` & `fieldName`, Optional: `options`

### getIndices(HandlerGetindices)

Returns an array that holds a list of documents that identify and describe the existing indexes on the collection, Command arguments, Required: `collectionName`, Optional: `options`

### renameCollection(HandlerRenameColleciton)

Rename a collection Command arguments, Required: `collectionName`, `fieldName` (new collection name), Optional: `options`

### deleteItemSingle(HandlerDeleteItem)

Delete a single item as defined by the passed query, Command arguments, Required: `collectionName` & `query`, Optional: `options`

### deleteItemMany(HandlerDeleteItem)

Delete all items matching the passed query, Command arguments, Required: `collectionName` & `query`, Optional: `options`

### doesCollectionExist(HandlerBaseRequest)

Check if a collection exists in the DB, Command arguments, Required: `collectionName`

### createCollection(HandlerModifyCollection)

Create a new collection, Command arguments, Required: `collectionName`, Optional: `options`

### dropCollection(HandlerModifyCollection)

Drop the entire collection, Command arguments, Required: `collectionName` & `query`, Optional: `options`

### dropDatabase(databaseName)

Drop the entire database. Database name is required.

## Exported Interfaces

- MongoDBInterface : Used to initialise the MongoDB handler
- MongoDBListInterface : Stores information about each database
- MongoDBCommandInterface : Used to pass MongoDB command parmeters

## Examples

See [Library Test](https://github.com/aThornes/mongodb-if/tree/master/test) for some basic usage examples.
