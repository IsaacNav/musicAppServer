/* eslint-disable no-useless-escape */
const sanitize = require("mongo-sanitize");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("../config/bcrypt");
const generatePassword = require("../../../utils/helpers");

const { schemaOptions } = require("../../../../utils/helpers");
const ModulesSchema = require("./modules");
const RolesSchema = require("./roles");
require("./comercialHouses");
require("./delegations");

const { STATUS, getPermissions } = require("../helpers/users");

const schema = mongoose.Schema(
  {
    highLevel: {
      type: Boolean,
      default: false,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    mothersLastName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) =>
          /^[\w]+([\.-]?\w)*@\w+([\-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      autopopulate: true,
    },
    password: {
      type: String,
      required: true,
      set: bcrypt.encrypt,
      select: false,
    },
    status: {
      type: Boolean,
      default: STATUS.ACTIVE,
    },
    image: {
      type: String,
      default: "defaultProfile.jpg",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RolesSchema,
      required: true,
      autopopulate: true,
    },
    ownerOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "ownerOrganizationModel",
      autopopulate: true,
    },
    ownerOrganizationModel: {
      type: String,
      required: true,
      enum: ["comercialhouses", "delegations"],
    },
    agreements: [
      {
        name: {
          type: String,
          required: true,
        },
        id: {
          type: String,
          required: true,
        },
      },
    ],
    permissions: [
      {
        module: {
          type: mongoose.Schema.Types.ObjectId,
          ref: ModulesSchema,
          autopopulate: true,
        },
        permissions: {
          type: Object,
        },
      },
    ],
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) =>
          /^[\d]{1,3}\.([\d]{1,3}){1}\.([\d]{1,4}){1}$/.test(v) ||
          /^[\d]{7,10}$/.test(v),
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    adminToken: String,
    socketId: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    ...schemaOptions,
  }
);

schema.index({ firstName: 1, lastName: 1 });
schema.index({ fullName: 1 });
schema.index({ ownerOrganization: 1 });

schema.plugin(require("mongoose-autopopulate"));

/**
 * make a flexible image url
 */
schema.virtual("imageUrl").get(function () {
  const { SERVER_URL } = process.env;
  return `${SERVER_URL}/images/users/${this.image}`;
});

/**
 * If the registered user does not have a role
 * assign the lowest level
 */
schema.pre("save", async function (next) {
  if (!this.role) {
    const Roles = require("./roles");
    const userRole = await Roles.findOne({ name: "user" });
    this.role = userRole._id;
  }
  next();
});

/**
 * @returns {Boolean}
 * validate a bcrypt password
 */
schema.methods.validatePassword = function (password, hash) {
  return bcrypt.compare(password, hash);
};

/**
 * @returns {Numç}
 * generate a expirtation date for JWT
 */
const generateExpirationDate = () => {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);
  return parseInt(expirationDate.getTime() / 1000, 10);
};

/**
 * @returns {String}
 * make a json web token
 */
schema.methods.generateJWT = function () {
  const expirationDate = generateExpirationDate();
  const { JWT_SECRET } = process.env;
  return jwt.sign(
    {
      id: this._id,
      exp: expirationDate,
    },
    JWT_SECRET
  );
};

/**
 * @returns {Object}
 * format user data
 */
schema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    permissions: getPermissions(this.role).populate,
    role: this.role,
    token: this.generateJWT(),
    ownerOrganization: this.ownerOrganization,
    ownerOrganizationModel: this.ownerOrganizationModel,
    adminToken: this.adminToken,
  };
};

const usersQuery = (params) => {
  const {
    role = "",
    ownerOrganization = "",
    search = "",
    startDate = "",
    endDate = "",
    ...rest
  } = params;
  const cleanSearch = sanitize(search);
  const initDate = Boolean(startDate) && moment(startDate).toISOString();
  const lastDate = Boolean(endDate) && moment(endDate).toISOString();
  const createdAt = {
    ...(initDate ? { $gt: initDate } : {}),
    ...(lastDate ? { $lt: lastDate } : {}),
  };
  const sort = startDate ? { createdAt: 1 } : { createdAt: -1 };
  const regExp = RegExp(cleanSearch);
  const setSearch = [
    {
      $or: [
        { fullName: { $regex: regExp, $options: "i" } },
        { email: { $regex: regExp, $options: "i" } },
      ],
    },
  ];

  const query = {
    ...(role ? { role } : {}),
    ...(ownerOrganization ? { ownerOrganization } : {}),
    ...(search ? { $and: setSearch } : {}),
    ...(initDate || lastDate ? { createdAt } : {}),
    ...rest,
  };
  return { query, sort };
};

schema.statics.status = function (id, status) {
  return this.findOneAndUpdate(
    { _id: id },
    { $set: { status } },
    { new: true }
  );
};

schema.statics.findByComercialHouseId = function ({ skip, limit, query }) {
  const { query: _query, sort } = usersQuery(query);
  return this.find(_query)
    .sort({ ...sort })
    .skip(parseInt(skip, 10))
    .limit(parseInt(limit, 10));
};

schema.statics.findByRoleId = function ({ skip, limit, query }) {
  const { query: _query, sort = { createdAt: -1 } } = usersQuery(query);
  return this.find(_query)
    .sort({ ...sort })
    .skip(parseInt(skip, 10))
    .limit(parseInt(limit, 10));
};

schema.statics.count = function (params) {
  const { query } = usersQuery(params);
  return this.find(query).lean().countDocuments();
};

schema.statics.updateUser = function ({ _id, user }) {
  return this.findOneAndUpdate({ _id }, { $set: { ...user } }, { new: true });
};

schema.statics.search = function (params) {
  const { query } = usersQuery(params);
  return this.find(query);
};

schema.pre("validate", function (next) {
  if (!this.password) {
    const { ENV } = process.env;
    if (ENV === "production") this.password = generatePassword(configPassword);
    else this.password = "Hola.1234";
    next();
  }
  next();
});

const Model = mongoose.model("users", schema);

module.exports = Model;
