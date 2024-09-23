const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/User");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("../utils/email");
const bcrypt = require('bcryptjs');
const { sendMail } = require('../utils/sendEmail');
const User = require('../models/Users'); 
require("dotenv").config();

//@Desc Registration for users
//@Route POST /api/auths/register
//@Access Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create a new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });
        const firstName = user.name.split(' ')[0];

        await sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Welcome to QzPlatform!',
            html: `
                <p>Dear ${firstName},</p>
        
                <p>Welcome to QzPlatform! We are thrilled to have you join our community as a ${user.role}. Your registration was successful, and you are now ready to explore all the features and tools we offer to help you create engaging and effective assessments.</p>
        
                <p>To get started, please log in to your account using your registered email address. We encourage you to take a moment to familiarize yourself with the platform, set up your profile, and begin creating your first test.</p>
        
                <p>If you have any questions or need assistance, our support team is here to help. Do not hesitate to reach out to us at any time.</p>
        
                <p>Thank you for choosing QzPlatform. We look forward to supporting you on your journey to create impactful assessments!</p>
        
                <p>Best regards,<br>
                <strong>The QzPlatform Team</strong></p>
            `
        });
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//@Desc  Login 
//@Route POST /api/auths/login
//@Access Public
const login = async (req, res) => {
    try {
        const { email, password, role, keepMeSignedIn } = req.body;

        // Find the user by email and role
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'You have been deactivated, contact administrator' });
        }

        // Compare the entered password with the stored password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a token with the user's id and role
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            {
                expiresIn: keepMeSignedIn ? '7d' : '1h'
            }
        );

        // Send the token and firstname in the response
        res.status(200).json({
            token,
            firstname: user.name.split(' ')[0] // Include the user's first name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always return success message for security reasons instead of user email not found
        if (!user) {
            return res.status(200).json({ message: 'Reset password link sent' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        //const resetPasswordUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;
        const resetPasswordUrl = `https://qzplatform.com/reset-password/${resetToken}`;
        console.log("Generated Reset URL:", resetPasswordUrl);


        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const firstName = user.name.split(' ')[0];

        // Send reset password email
        await sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset Request - QzPlatform',
            html: `
                <p>Dear ${firstName},</p>
        
                <p>We received a request to reset the password for your account on QzPlatform. To proceed with the password reset, please click the link below:</p>
        
                <p><a href="${resetPasswordUrl}" target="_blank">${resetPasswordUrl}</a></p>
        
                <p>If you did not request a password reset, please disregard this email. Your account security is important to us, and no changes will be made without your confirmation.</p>
        
                <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
        
                <p>Thank you,<br>
                <strong>The QzPlatform Team</strong></p>
            `
        });
        

        res.status(200).json({ message: 'Reset password link sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const { token } = req.params; // Get token from URL parameters

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Find user by reset token without checking for expiration
        const user = await User.findOne({ resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
         });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Update the user's password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Exporting the functions
module.exports = {
    register,
    login,
    forgotPassword,
    changePassword
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Sending an email to the user with instructions and a reset URL, and returning a success response to the client.
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
