export default {
  type: 'object',
  properties: {
    billId: { type: 'string' },
    menuName: { type: 'string' },
    options: { type: 'string[]' },
    price: { type: 'number' },
    protoUrl: { type: 'string' }
  },
  required: ['billId', 'menuName', 'price']
} as const
