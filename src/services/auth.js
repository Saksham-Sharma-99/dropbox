
const { v4: uuidV4 } = require("uuid");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { Session } = require("../models/session");
const { User } = require("../models/user")
dotenv.config();

const loginUser = async ({ email, password }) => {
    try{
        const hashedPassword = await bcrypt.hash(password, Number(process.env.HASH_ROUNDS));
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return { error: "Invalid email or password", user: null };
        }

        const correctPassword = await bcrypt.compare(password, user.password)
        if (!correctPassword) {
            return { error: "Invalid email or password", user: null };
        }
        
        const accessToken = `${user.id}:${Date.now()}:${uuidV4()}`
        const session = await Session.create({ userId: user.id, accessToken: accessToken });
        return { user, session, error: null };

    } catch (error) {
        return { error: error.message, user: null };
    }
}

const validateLoginParams = async ({ email, password }) => {
    const missingFields = []

    if (!email) {
        missingFields.push("email");
    }
    if (!password) {
        missingFields.push("password");
    }

    if (missingFields.length > 0) {
        return { valid: false, error: `Missing fields: ${missingFields.join(", ")}` };
    }

    return { valid: true };
}

const logoutUser = async ({ session }) => {
    if (!session) {
        return { error: "Unauthorized", session: null };
    }
    session.status = "inactive";
    await session.save();
    return { session, error: null };
}   

module.exports = {
    loginUser, validateLoginParams, logoutUser
}