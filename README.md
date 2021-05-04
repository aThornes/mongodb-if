# MongoDB Database Interface

A simple MongoDB interface library built upon the [mongodb library](https://www.npmjs.com/package/mongodb)

## Initialise

The MongoDBHandler class is the core of the MongoDB interface, you can create the database interface instance using:

    const DBHandler = MongoDBHandler({connectionDomain, connectionOptions, dbNameList, dbListOptions});

or
    const DBHandler = MongoDBHandler(MongoDBInterface);

## Initialisation parameters

- `connectionDomain` refers to your MongoDB connection string, a typical connection string might be `mongodb://127.0.0.1:27017`
- `connectionOptions` refer to your MongoDB connection options which can be found under MongoDBClient documentation and are defined by the interface `MongoClientOptions`
- `dbNameList` is a string array containing the names of each database you wish to connect to.
- `dbListOptions` is a `MongoClientCommonOption` array containing the connection parameters for each database in `dbNameList`

## Available Functions

- connect()

Establish a connection to each of the requested databases
Returns Promise<boolean> Success

- disconnect()

Close a connection to all databases
Returns boolean Success

- getDatabaseObjectList() :MongoDBListInterface[]

Get the list of associated databases, includes name and database object
Returns MongoDBListInterface[] Database list

- getDataItem(MongoDBCommandInterface)

Retrieve a data item, command interface must include `collectionName` and `query`, optional: `dbName` (note: if not provided, the first database in list will be selected)

- addDataItem(MongoDBCommandInterface)

Add a data item, command interface must include `collectionName`, `query` and `data`, optional: `dbName`

- appendDataItem(MongoDBCommandInterface)

Append to a data item, command interface must include `collectionName`, `query` and `data`, optional: `dbName`

- getFieldList(MongoDBCommandInterface)

Retrieve every value with the matching field (database key) as a list, command interface must include `collectionName` and `fieldName`, optional: `dbName`

- deleteItemSingle(MongoDBCommandInterface)

Delete a single item as defined by the passed query, command interface must include `collectionName` and `query`, optional: `dbName`

- deleteItemMany(MongoDBCommandInterface)

Delete all items matching the passed query, command interface must include `collectionName` and `query`, optional: `dbName`

## Exported Interfaces

- MongoDBInterface : Used to initialise the MongoDB handler
- MongoDBListInterface : Stores information about each database
- MongoDBCommandInterface : Used to pass MongoDB command parmeters

# Development

This is currently still work in progress and more functionality will be added shortly.
