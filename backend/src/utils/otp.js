import crypto from 'crypto';
import ApiError from './ApiError.js';

const OTP_SECRET = process.env.OTP_SECRET || 'fail-safe-otp-secret-123193789624631';

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generates a verification token for email confirmation.
 * The token contains a hash of the email, OTP, and expiry timestamp.
 * 
 * @param {string} email - The user's email address
 * @param {string} otp - The One-Time Password
 * @param {number} [expiresInMinutes=10] - Expiry time in minutes
 * @returns {string} The verification token in the format "<hash>.<expiresAt>"
 */
const generateVerificationToken = (email, otp, expiresInMinutes = 10) => {
    try {
        const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
        const data = `${email.toLowerCase().trim()}.${otp}.${expiresAt}`;

        const hash = crypto.createHmac('sha256', OTP_SECRET)
            .update(data)
            .digest('hex');

        return `${hash}.${expiresAt}`;

    } catch (error) {
        console.error("Error generating verification token: ", error);
        throw new ApiError(500, "Error while generating verification token");
    }
}

/**
 * Verifies the verification token.
 * 
 * @param {string} email - The user's email address
 * @param {string} otp - The One-Time Password
 * @param {string} verificationToken - The verification token to verify
 * @returns {{status:boolean, message:string, isValid:boolean}} - indicates success or failure
 */
const verifyVerificationToken = (email, otp, verificationToken) => {
    try {
        if (!email || !otp || !verificationToken) {
            return { status: false, message: "All fields are required", isValid: false }
        }

        const parts = verificationToken.split(".");

        if (parts.length !== 2) {
            return { status: false, message: "Invalid verification token", isValid: false }
        }

        const [receivedHash, expiresAt] = parts;
        const now = Date.now();

        if (expiresAt < now) {
            return { status: false, message: "Verification token has expired", isValid: false };
        }

        const data = `${email.toLowerCase().trim()}.${otp}.${expiresAt}`;

        const hash = crypto.createHmac('sha256', OTP_SECRET)
            .update(data)
            .digest('hex');

        if (receivedHash.length !== hash.length) {
            return { status: false, message: "Invalid verification token", isValid: false };
        }

        const isMatch = crypto.timingSafeEqual(
            Buffer.from(receivedHash, 'hex'),
            Buffer.from(hash, 'hex')
        );

        if (!isMatch) {
            return { status: false, message: "Invalid verification token", isValid: false };
        }

        return { status: true, message: "Verification token is valid", isValid: true };

    } catch (error) {
        console.error("Error verifying verification token: ", error);
        throw new ApiError(500, "Error while verifying verification token");
    }
}

export {
    generateOTP,
    generateVerificationToken,
    verifyVerificationToken
}