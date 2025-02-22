const { User } = require("../models/user")
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config();

const createUser = async ({ firstName, lastName, email, password }) => {
    try{
        const hashedPassword = await bcrypt.hash(password, Number(process.env.HASH_ROUNDS));
        newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        })
        return { newUser, error: null };
    } catch (error) {
        return { error: error.message, newUser: null };
    }
}

const validateUserParams = async ({ firstName, lastName, email, password }) => {
    const missingFields = []

    if (!firstName) {
        missingFields.push("firstName");
    }
    if (!lastName) {
        missingFields.push("lastName");
    }
    if (!email) {
        missingFields.push("email");
    }
    if (!password) {
        missingFields.push("password");
    }

    if (missingFields.length > 0) {
        return { valid: false, error: `Missing fields: ${missingFields.join(", ")}` };
    }

    const user = await User.findOne({ where: { email } });
    if (user) {
        return { valid: false, error: `User with email ${email} already exists` };
    }

    const passwordCheck = validPassword(password);
    if (passwordCheck.valid === false) {
        return { valid: false, error: passwordCheck.message };
    }

    return { valid: true };
}

const validPassword = (password) => {
    const minLength = 8;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= minLength;

    if (!isValidLength) {
        return { valid: false, message: "Password must be more than 8 characters long." };
    }
    if (!hasUpperCase) {
        return { valid: false, message: "Password must include at least one uppercase letter." };
    }
    if (!hasLowerCase) {
        return { valid: false, message: "Password must include at least one lowercase letter." };
    }
    if (!hasNumber) {
        return { valid: false, message: "Password must include at least one number." };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: "Password must include at least one special character (!@#$%^&*...)." };
    }

    return { valid: true, message: "Password is strong." };
}
    

module.exports = {
    createUser, validateUserParams
}