const usersRepository = require("../repositories/usersRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT } = require("../lib/const");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

const SALT_ROUND = 10;

class AuthService {
  static async register({ name, email, password, role }) {
    // Payload Validation

    if (!name) {
      return {
        status: false,
        status_code: 400,
        message: "Name is required",
        data: {
          registered_user: null,
        },
      };
    }

    if (!email) {
      return {
        status: false,
        status_code: 400,
        message: "Email is required",
        data: {
          registered_user: null,
        },
      };
    }

    if (!password) {
      return {
        status: false,
        status_code: 400,
        message: "Password is required",
        data: {
          registered_user: null,
        },
      };
    } else if (password.length < 8) {
      return {
        status: false,
        status_code: 400,
        message: "Password minimal 8 character",
        data: {
          registered_user: null,
        },
      };
    }
    if (!role) {
      return {
        status: false,
        status_code: 400,
        message: "Role is required",
        data: {
          registered_user: null,
        },
      };
    }

    const getUserByEmail = await usersRepository.getByEmail({ email });

    if (getUserByEmail) {
      return {
        status: false,
        status_code: 400,
        message: "Email already used",
        data: {
          registered_user: null,
        },
      };
    } else {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
      const createdUser = await usersRepository.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      return {
        status: true,
        status_code: 201,
        message: "User succesfully registered",
        data: {
          registered_user: createdUser,
        },
      };
    }
  }

  static async login({ email, password }) {
    // Payload Validation
    if (!email) {
      return {
        status: false,
        status_code: 400,
        message: "Email is required",
        data: {
          registered_user: null,
        },
      };
    }

    if (!password) {
      return {
        status: false,
        status_code: 400,
        message: "Password is required",
        data: {
          registered_user: null,
        },
      };
    } else if (password.length < 8) {
      return {
        status: false,
        status_code: 400,
        message: "Password minimal 8 character",
        data: {
          registered_user: null,
        },
      };
    }

    const getUser = await usersRepository.getByEmail({ email });

    if (!getUser) {
      return {
        status: false,
        status_code: 404,
        message: "Email not registered",
        data: {
          user: null,
        },
      };
    } else {
      const isPasswordMatch = await bcrypt.compare(password, getUser.password);

      if (isPasswordMatch) {
        const token = jwt.sign(
          {
            id: getUser.id,
            email: getUser.email,
          },
          JWT.SECRET,
          {
            expiresIn: JWT.EXPIRED,
          }
        );

        return {
          status: true,
          status_code: 200,
          message: "User Login Succesfully",
          data: {
            token,
          },
        };
      } else {
        return {
          status: false,
          status_code: 400,
          message: "Incorrect Password ",
          data: {
            user: null,
          },
        };
      }
    }
  }

  static async loginGoogle({ google_credential: googleCredential }) {
    try {
      // Get google user credential
      const client = new OAuth2Client(
        "615245282222-8tpns87f4toeomvcftf7h0rs2b3kbcui.apps.googleusercontent.com"
      );

      const userInfo = await client.verifyIdToken({
        idToken: googleCredential,
        audience:
          "615245282222-8tpns87f4toeomvcftf7h0rs2b3kbcui.apps.googleusercontent.com",
      });
      const { email, name } = userInfo.payload;
      console.log(userInfo);

      const getUserByEmail = await usersRepository.getByEmail({ email });

      if (!getUserByEmail) {
        await usersRepository.create({
          name,
          email,
          role: "user",
        });
      }

      const token = jwt.sign(
        {
          id: getUserByEmail.id,
          email: getUserByEmail.email,
        },
        JWT.SECRET,
        {
          expiresIn: JWT.EXPIRED,
        }
      );

      return {
        status: true,
        status_code: 200,
        message: "User Login Succesfully",
        data: {
          token,
        },
      };
    } catch (err) {
      console.log(err);
      return {
        status: false,
        status_code: 500,
        message: err.message,
        data: {
          registered_user: null,
        },
      };
    }
  }
}

module.exports = AuthService;
