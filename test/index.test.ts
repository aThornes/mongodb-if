import MongoDBHandler from '../src/MongoDBHandler';
import { MongoDBInterface } from '../src/types';

const mockHandlerOptions: MongoDBInterface = {
  connectionDomain: 'mongodb://127.0.0.1:00000',
  connectionOptions: {},
  dbNameList: ['TestDB', 'other'],
};

describe('Mongo Database Handler', () => {
  it('Can initialise a new instance of MongoDBHandler', () => {
    const handler = new MongoDBHandler(mockHandlerOptions);

    expect(handler).not.toBeNull();
  });
});
