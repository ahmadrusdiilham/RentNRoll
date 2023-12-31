const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { generateOTP, sendOTPByEmail } = require("../helpers/nodemailer");
const redis = require("../helpers/redis");
const { User, UserProfile, Order, Vehicle, Balance } = require("../models");

class UserController {
  static async register(req, res, next) {
    try {
      const { fullName, email, password, phone } = req.body;
      await User.create({ fullName, email, password, phone });
      res.status(201).json({ message: `Account succesfully created!` });
    } catch (error) {
      next(error);
    }
  }

  static async getOTP(req, res, next) {
    const { email, password } = req.body;
    try {
      if (!email || !password) throw { name: "login_empty_field" };
      const user = await User.findOne({ where: { email } });
      if (!user) throw { name: "email_is_not_registered" };
      const passValid = comparePassword(password, user.password);
      if (!passValid) throw { name: "invalid_password" };
      const generate_otp = generateOTP();

      await user.update({ otp: generate_otp });

      await sendOTPByEmail(user.email, generate_otp);
      res.json({ message: "OTP sent" });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    const { email, password, otp } = req.body;
    try {
      if (!email || !password) throw { name: "empty_field" };
      const user = await User.findOne({ where: { email } });
      if (!user) throw { name: "invalid_email_password" };
      const passValid = comparePassword(password, user.password);
      if (!passValid) throw { name: "invalid_email_password" };
      console.log(user, "===", otp);
      if (user.otp !== otp) throw { name: "invalid_otp" };
      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }

  static async createProfile(req, res, next) {
    try {

      if (!req.profilePicture) {
        throw { name: "Profile Picture is required!" };
      }
      if (!req.ktp) {
        throw { name: "KTP is required!" };
      }
      await UserProfile.create({
        profilePicture: req.profilePicture,
        ktp: req.ktp,
        simA: req.simA,
        simC: req.simC,
        UserId: req.user.id,
      });
      res.status(201).json({ message: `Account profile succesfully created!` });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {

      const data = await User.findOne({
        where: { email: req.user.email },
        attributes: { exclude: ["password"] },
        include: [
          {
            model: UserProfile,
          },
          {
            model: Balance,
          },
          {
            model: Order,
            include: Vehicle,
          },
          {
            model: Vehicle
          }
        ],
      });
      const totalOrders = data.Orders.length;
      data.dataValues.totalOrders = totalOrders;
      const totalAmount = data.Balances.reduce((sum, balance) => sum + balance.amount, 0);

      // Insert the total amount into the user object
      data.dataValues.totalAmount = totalAmount;

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async editProfile(req, res, next) {
    try {
      const { ktp, simA, simC, profilePicture } = req;
      if (!ktp) {
        throw { name: "KTP is required!" };
      }
      if (!profilePicture) {
        throw { name: "Profile Picture is required!" };
      }
      await UserProfile.update({ ktp, simA, simC, profilePicture }, { where: { UserId: req.user.id } });

      res.json({ message: "Successfully updated!" });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {

      await User.destroy({ where: { id: req.user.id } });
      res.json({ message: "Account successfully deleted!" });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
