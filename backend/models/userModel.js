const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    f_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"]
    },
    l_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"]
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      minlength: [4, "Username must be at least 4 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: String,
    verificationCodeExpires: Date,

    type: {
      type: String,
      enum: ["student", "user", "admin", "guide"],
      default: "student"
    },

    // Additional fields from NewUser.js
    dateOfBirth: {
      type: Date
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    address: {
      street: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        trim: true
      },
      zipCode: {
        type: String,
        trim: true
      }
    },

    profileImage: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["user", "admin", "guide"],
      default: "user"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    preferences: {
      favoriteDestinations: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Destination"
        }
      ],
      travelStyle: {
        type: String,
        enum: ["adventure", "relaxation", "cultural", "luxury", "budget"]
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        sms: {
          type: Boolean,
          default: false
        }
      }
    },

    bookingHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
      }
    ],

    resetPasswordToken: {
      type: String
    },

    resetPasswordExpires: {
      type: Date
    },

    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name virtual
userSchema.virtual("fullName").get(function () {
  return `${this.f_name} ${this.l_name}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.verificationCode;
  return user;
};

module.exports = mongoose.model("User", userSchema);
