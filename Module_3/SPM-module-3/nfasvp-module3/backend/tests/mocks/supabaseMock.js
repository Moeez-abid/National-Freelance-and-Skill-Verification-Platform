'use strict';

// tests/mocks/supabaseMock.js

const mockSelect = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockDelete = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockRange = jest.fn().mockReturnThis();
const mockRpc = jest.fn();

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
  order: mockOrder,
  limit: mockLimit,
  range: mockRange,
}));

const supabaseMock = {
  from: mockFrom,
  rpc: mockRpc,
};

module.exports = {
  supabaseMock,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockEq,
  mockSingle,
  mockOrder,
  mockLimit,
  mockRange,
  mockRpc,
  mockFrom,
};
