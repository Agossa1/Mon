
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.OTPScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  code: 'code',
  type: 'type',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  used: 'used'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  fullName: 'fullName',
  email: 'email',
  emailVerified: 'emailVerified',
  phone: 'phone',
  phoneVerified: 'phoneVerified',
  password: 'password',
  role: 'role',
  loginAttempts: 'loginAttempts',
  lockedUntil: 'lockedUntil',
  lastLogin: 'lastLogin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  bio: 'bio',
  avatar: 'avatar',
  coverImage: 'coverImage',
  address: 'address',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
  countryCode: 'countryCode',
  phoneNumber: 'phoneNumber',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  website: 'website',
  socialLinks: 'socialLinks',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  recipientName: 'recipientName',
  street: 'street',
  streetComplement: 'streetComplement',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
  phoneNumber: 'phoneNumber',
  isDefault: 'isDefault',
  coordinates: 'coordinates',
  instructions: 'instructions',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentMethodScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  accountNumber: 'accountNumber',
  expiryDate: 'expiryDate',
  isDefault: 'isDefault',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  icon: 'icon',
  image: 'image',
  parentId: 'parentId',
  featured: 'featured',
  displayOrder: 'displayOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  shortDescription: 'shortDescription',
  price: 'price',
  compareAtPrice: 'compareAtPrice',
  costPrice: 'costPrice',
  sku: 'sku',
  barcode: 'barcode',
  inventory: 'inventory',
  lowStockThreshold: 'lowStockThreshold',
  trackInventory: 'trackInventory',
  weight: 'weight',
  dimensions: 'dimensions',
  images: 'images',
  videos: 'videos',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  metaKeywords: 'metaKeywords',
  status: 'status',
  visibility: 'visibility',
  featured: 'featured',
  shopId: 'shopId',
  brand: 'brand',
  manufacturer: 'manufacturer',
  countryOfOrigin: 'countryOfOrigin',
  warrantyInfo: 'warrantyInfo',
  hasVariants: 'hasVariants',
  attributes: 'attributes',
  rating: 'rating',
  reviewCount: 'reviewCount',
  salesCount: 'salesCount',
  viewCount: 'viewCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductVariantScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  name: 'name',
  sku: 'sku',
  barcode: 'barcode',
  price: 'price',
  compareAtPrice: 'compareAtPrice',
  inventory: 'inventory',
  images: 'images',
  attributes: 'attributes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subtotal: 'subtotal',
  discountTotal: 'discountTotal',
  taxTotal: 'taxTotal',
  shippingTotal: 'shippingTotal',
  total: 'total',
  couponCode: 'couponCode',
  couponDiscount: 'couponDiscount',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  cartId: 'cartId',
  productId: 'productId',
  variantId: 'variantId',
  quantity: 'quantity',
  price: 'price',
  total: 'total',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WishlistItemScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  createdAt: 'createdAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  userId: 'userId',
  subtotal: 'subtotal',
  discountTotal: 'discountTotal',
  taxTotal: 'taxTotal',
  shippingTotal: 'shippingTotal',
  total: 'total',
  status: 'status',
  paymentStatus: 'paymentStatus',
  fulfillmentStatus: 'fulfillmentStatus',
  addressId: 'addressId',
  shippingAddress: 'shippingAddress',
  shippingMethod: 'shippingMethod',
  shippingCarrier: 'shippingCarrier',
  trackingNumber: 'trackingNumber',
  estimatedDelivery: 'estimatedDelivery',
  paymentMethod: 'paymentMethod',
  transactionId: 'transactionId',
  notes: 'notes',
  customerNotes: 'customerNotes',
  couponCode: 'couponCode',
  shopId: 'shopId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  variantId: 'variantId',
  name: 'name',
  sku: 'sku',
  price: 'price',
  quantity: 'quantity',
  total: 'total',
  weight: 'weight',
  options: 'options',
  metadata: 'metadata',
  fulfillmentStatus: 'fulfillmentStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  paymentMethodId: 'paymentMethodId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  type: 'type',
  reference: 'reference',
  gateway: 'gateway',
  gatewayResponse: 'gatewayResponse',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  rating: 'rating',
  title: 'title',
  comment: 'comment',
  images: 'images',
  status: 'status',
  moderationComment: 'moderationComment',
  helpfulCount: 'helpfulCount',
  reportCount: 'reportCount',
  isVerifiedPurchase: 'isVerifiedPurchase',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  image: 'image',
  link: 'link',
  read: 'read',
  readAt: 'readAt',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ShopScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  shopType: 'shopType',
  description: 'description',
  shortDescription: 'shortDescription',
  logo: 'logo',
  banner: 'banner',
  colors: 'colors',
  category: 'category',
  subCategories: 'subCategories',
  tags: 'tags',
  ownerId: 'ownerId',
  teamMembers: 'teamMembers',
  firstName: 'firstName',
  lastName: 'lastName',
  dateOfBirth: 'dateOfBirth',
  identityType: 'identityType',
  identityNumber: 'identityNumber',
  identityDocument: 'identityDocument',
  identityVerified: 'identityVerified',
  businessName: 'businessName',
  taxId: 'taxId',
  registrationNumber: 'registrationNumber',
  businessDocument: 'businessDocument',
  businessVerified: 'businessVerified',
  email: 'email',
  phone: 'phone',
  website: 'website',
  socialMedia: 'socialMedia',
  address: 'address',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
  coordinates: 'coordinates',
  currency: 'currency',
  languages: 'languages',
  timeZone: 'timeZone',
  shippingMethods: 'shippingMethods',
  shippingZones: 'shippingZones',
  paymentMethods: 'paymentMethods',
  bankAccount: 'bankAccount',
  rating: 'rating',
  reviewCount: 'reviewCount',
  salesCount: 'salesCount',
  productCount: 'productCount',
  followerCount: 'followerCount',
  status: 'status',
  featured: 'featured',
  verified: 'verified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  code: 'code',
  description: 'description',
  type: 'type',
  value: 'value',
  minOrderAmount: 'minOrderAmount',
  maxUsage: 'maxUsage',
  usageCount: 'usageCount',
  perUserLimit: 'perUserLimit',
  startDate: 'startDate',
  endDate: 'endDate',
  shopId: 'shopId',
  productIds: 'productIds',
  categoryIds: 'categoryIds',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  shopId: 'shopId'
};

exports.Prisma.ConversationParticipantScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
  leftAt: 'leftAt',
  isActive: 'isActive',
  lastReadAt: 'lastReadAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  senderId: 'senderId',
  content: 'content',
  attachments: 'attachments',
  readBy: 'readBy',
  status: 'status',
  sentAt: 'sentAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  isDeleted: 'isDeleted',
  replyToId: 'replyToId'
};

exports.Prisma.ShopMemberScalarFieldEnum = {
  id: 'id',
  shopId: 'shopId',
  userId: 'userId',
  role: 'role',
  isActive: 'isActive',
  joinedAt: 'joinedAt',
  invitedBy: 'invitedBy',
  permissions: 'permissions'
};

exports.Prisma.ShopInvitationScalarFieldEnum = {
  id: 'id',
  shopId: 'shopId',
  email: 'email',
  role: 'role',
  token: 'token',
  expiresAt: 'expiresAt',
  invitedBy: 'invitedBy',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InventoryScalarFieldEnum = {
  id: 'id',
  shopId: 'shopId',
  productId: 'productId',
  variantId: 'variantId',
  sku: 'sku',
  barcode: 'barcode',
  quantity: 'quantity',
  location: 'location',
  lowStockThreshold: 'lowStockThreshold',
  notifyOnLowStock: 'notifyOnLowStock',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InventoryMovementScalarFieldEnum = {
  id: 'id',
  inventoryId: 'inventoryId',
  type: 'type',
  quantity: 'quantity',
  reason: 'reason',
  reference: 'reference',
  metadata: 'metadata',
  performedBy: 'performedBy',
  createdAt: 'createdAt'
};

exports.Prisma.SupplierScalarFieldEnum = {
  id: 'id',
  shopId: 'shopId',
  name: 'name',
  contactName: 'contactName',
  email: 'email',
  phone: 'phone',
  address: 'address',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
  website: 'website',
  notes: 'notes',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SupplierProductScalarFieldEnum = {
  id: 'id',
  supplierId: 'supplierId',
  productId: 'productId',
  supplierSku: 'supplierSku',
  costPrice: 'costPrice',
  minOrderQty: 'minOrderQty',
  leadTime: 'leadTime',
  isPreferred: 'isPreferred',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  MODERATOR: 'MODERATOR',
  SUPPORT: 'SUPPORT'
};

exports.Gender = exports.$Enums.Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY'
};

exports.ProductStatus = exports.$Enums.ProductStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
};

exports.ProductVisibility = exports.$Enums.ProductVisibility = {
  VISIBLE: 'VISIBLE',
  HIDDEN: 'HIDDEN',
  FEATURED: 'FEATURED',
  SEARCH_ONLY: 'SEARCH_ONLY'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  ON_HOLD: 'ON_HOLD'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  FAILED: 'FAILED'
};

exports.FulfillmentStatus = exports.$Enums.FulfillmentStatus = {
  UNFULFILLED: 'UNFULFILLED',
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
  FULFILLED: 'FULFILLED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
  EXCHANGE: 'EXCHANGE'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  DISPUTED: 'DISPUTED',
  EXPIRED: 'EXPIRED'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  CAPTURE: 'CAPTURE',
  AUTHORIZATION: 'AUTHORIZATION',
  VOID: 'VOID',
  FEE: 'FEE',
  TRANSFER: 'TRANSFER'
};

exports.ReviewStatus = exports.$Enums.ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED'
};

exports.ShopType = exports.$Enums.ShopType = {
  INDIVIDUAL: 'INDIVIDUAL',
  COMPANY: 'COMPANY',
  FREELANCER: 'FREELANCER',
  ORGANIZATION: 'ORGANIZATION'
};

exports.ShopCategory = exports.$Enums.ShopCategory = {
  ELECTRONICS: 'ELECTRONICS',
  FASHION: 'FASHION',
  HOME: 'HOME',
  BEAUTY: 'BEAUTY',
  FOOD: 'FOOD',
  HEALTH: 'HEALTH',
  SPORTS: 'SPORTS',
  BOOKS: 'BOOKS',
  SERVICES: 'SERVICES',
  OTHER: 'OTHER'
};

exports.IdentityType = exports.$Enums.IdentityType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  DRIVER_LICENSE: 'DRIVER_LICENSE',
  RESIDENCE_CARD: 'RESIDENCE_CARD',
  TAX_CARD: 'TAX_CARD',
  OTHER: 'OTHER'
};

exports.ShopStatus = exports.$Enums.ShopStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
  INACTIVE: 'INACTIVE'
};

exports.CouponType = exports.$Enums.CouponType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  FREE_SHIPPING: 'FREE_SHIPPING',
  BUY_X_GET_Y: 'BUY_X_GET_Y',
  FIRST_ORDER: 'FIRST_ORDER'
};

exports.ConversationType = exports.$Enums.ConversationType = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
  SUPPORT: 'SUPPORT',
  SHOP: 'SHOP'
};

exports.ParticipantRole = exports.$Enums.ParticipantRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST'
};

exports.MessageStatus = exports.$Enums.MessageStatus = {
  SENDING: 'SENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED'
};

exports.ShopRole = exports.$Enums.ShopRole = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  INVENTORY: 'INVENTORY',
  ORDERS: 'ORDERS',
  MARKETING: 'MARKETING',
  SUPPORT: 'SUPPORT',
  CONTENT: 'CONTENT',
  VIEWER: 'VIEWER'
};

exports.InvitationStatus = exports.$Enums.InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

exports.MovementType = exports.$Enums.MovementType = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  RETURN: 'RETURN',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER: 'TRANSFER',
  LOSS: 'LOSS',
  PRODUCTION: 'PRODUCTION',
  INITIAL: 'INITIAL'
};

exports.Prisma.ModelName = {
  OTP: 'OTP',
  User: 'User',
  Profile: 'Profile',
  Address: 'Address',
  PaymentMethod: 'PaymentMethod',
  Category: 'Category',
  Product: 'Product',
  ProductVariant: 'ProductVariant',
  Cart: 'Cart',
  CartItem: 'CartItem',
  WishlistItem: 'WishlistItem',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Transaction: 'Transaction',
  Review: 'Review',
  Notification: 'Notification',
  Shop: 'Shop',
  Coupon: 'Coupon',
  Conversation: 'Conversation',
  ConversationParticipant: 'ConversationParticipant',
  Message: 'Message',
  ShopMember: 'ShopMember',
  ShopInvitation: 'ShopInvitation',
  Inventory: 'Inventory',
  InventoryMovement: 'InventoryMovement',
  Supplier: 'Supplier',
  SupplierProduct: 'SupplierProduct'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
