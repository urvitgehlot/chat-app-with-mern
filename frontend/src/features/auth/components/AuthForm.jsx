import React, { useEffect, useState, useRef } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, Mail, RotateCw, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../useAuth';

function AuthForm({ type, submitHandler, sendOtp: propSendOtp, loading, error, passwordError }) {
    const { sendOtp: hookSendOtp } = useAuth();
    const onSendOtp = propSendOtp || hookSendOtp;

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        "confirm-password": ""
    });

    const [showPassword, setShowPassword] = useState(false);

    // Signup OTP Step state: 1 = Details, 2 = OTP Verification
    const [step, setStep] = useState(1);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [verificationToken, setVerificationToken] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [localError, setLocalError] = useState(null);
    const [otpSentNotice, setOtpSentNotice] = useState(false);

    const inputRefs = useRef([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (localError) setLocalError(null);
    };

    // Reset state when switching between login and signup
    useEffect(() => {
        setFormData({
            email: "",
            password: "",
            "confirm-password": ""
        });
        setShowPassword(false);
        setStep(1);
        setOtpDigits(['', '', '', '', '', '']);
        setVerificationToken("");
        setLocalError(null);
        setOtpSentNotice(false);
        setResendTimer(0);
    }, [type]);

    // Countdown timer matching backend token bucket rate limiter
    useEffect(() => {
        let interval = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer]);

    // Auto-focus the first OTP input when entering step 2
    useEffect(() => {
        if (step === 2) {
            inputRefs.current[0]?.focus();
        }
    }, [step]);

    // Handle Send OTP (Step 1 -> Step 2)
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setLocalError(null);

        // Validation for step 1
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
            setLocalError("Please enter a valid email address.");
            return;
        }

        if (!formData.password || formData.password.length < 6) {
            setLocalError("Password must be at least 6 characters.");
            return;
        }

        if (formData.password !== formData["confirm-password"]) {
            setLocalError("Passwords do not match.");
            return;
        }

        setSendingOtp(true);
        try {
            const res = await onSendOtp({
                email: formData.email.trim().toLowerCase(),
            });

            const token = res?.data?.verificationToken;
            if (token) {
                setVerificationToken(token);
                setStep(2);
                setResendTimer(180);
                setOtpSentNotice(true);
                setTimeout(() => setOtpSentNotice(false), 4000);
            } else {
                setLocalError("Failed to receive verification token from server.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to send verification code. Please try again.";
            setLocalError(errorMsg);
            const retryAfter = err.response?.data?.retryAfter;
            if (retryAfter && typeof retryAfter === "number") {
                setResendTimer(retryAfter);
            }
        } finally {
            setSendingOtp(false);
        }
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        if (resendTimer > 0 || sendingOtp) return;
        setSendingOtp(true);
        setLocalError(null);

        try {
            const res = await onSendOtp({
                email: formData.email.trim().toLowerCase(),
            });

            const token = res?.data?.verificationToken;
            if (token) {
                setVerificationToken(token);
                setOtpDigits(['', '', '', '', '', '']);
                setResendTimer(180);
                setOtpSentNotice(true);
                setTimeout(() => setOtpSentNotice(false), 4000);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to resend verification code. Please try again later.";
            setLocalError(errorMsg);
            const retryAfter = err.response?.data?.retryAfter;
            if (retryAfter && typeof retryAfter === "number") {
                setResendTimer(retryAfter);
            }
        } finally {
            setSendingOtp(false);
        }
    };

    // OTP Input handlers
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...otpDigits];
        const char = value.slice(-1);
        newDigits[index] = char;
        setOtpDigits(newDigits);
        if (localError) setLocalError(null);

        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otpDigits[index]) {
                const newDigits = [...otpDigits];
                newDigits[index] = '';
                setOtpDigits(newDigits);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                const newDigits = [...otpDigits];
                newDigits[index - 1] = '';
                setOtpDigits(newDigits);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;

        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        if (localError) setLocalError(null);

        const nextEmpty = newDigits.findIndex((d) => !d);
        const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
        inputRefs.current[focusIdx]?.focus();
    };

    // Step 2 Final Submission
    const handleStepTwoSubmit = (e) => {
        e.preventDefault();
        setLocalError(null);

        const enteredOtp = otpDigits.join('');
        if (enteredOtp.length !== 6) {
            setLocalError("Please enter all 6 digits of the OTP code.");
            return;
        }

        if (!verificationToken) {
            setLocalError("Verification token missing. Please request a new OTP.");
            return;
        }

        // Passes full credentials payload to parent handleSubmit
        submitHandler(e, {
            ...formData,
            email: formData.email.trim().toLowerCase(),
            otp: enteredOtp,
            verificationToken: verificationToken,
        });
    };

    const activeError = localError || error || (type === "signup" ? passwordError : null);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <form
            className="flex flex-col gap-4 w-full"
            onSubmit={(e) => {
                if (type === 'login') {
                    submitHandler(e, formData);
                } else if (step === 1) {
                    handleSendOtp(e);
                } else {
                    handleStepTwoSubmit(e);
                }
            }}
        >
            {/* Signup Step Progress Indicator */}
            {type === 'signup' && (
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-border/50">
                    <span className="text-[11px] font-semibold text-text-secondary tracking-wide uppercase">
                        {step === 1 ? 'Step 1 of 2: Account Credentials' : 'Step 2 of 2: Email Verification'}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'w-5 bg-primary' : 'w-2 bg-border'}`} />
                        <span className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'w-5 bg-primary' : 'w-2 bg-border'}`} />
                    </div>
                </div>
            )}

            {/* Email Input (Login OR Signup Step 1) */}
            {(type === 'login' || (type === 'signup' && step === 1)) && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary">
                        {type === 'login' ? 'Email or Username' : 'Email address'}
                    </label>
                    <input
                        className="w-full rounded-xl bg-bg-card border border-border px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary/70 focus:ring-1 focus:ring-primary/20"
                        placeholder={type === 'login' ? "name@example.com or username" : "name@example.com"}
                        type={type === 'login' ? "text" : "email"}
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            )}

            {/* Password Input (Login OR Signup Step 1) */}
            {(type === 'login' || (type === 'signup' && step === 1)) && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary">
                        Password
                    </label>
                    <div className="relative flex items-center">
                        <input
                            className="w-full rounded-xl bg-bg-card border border-border px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary/70 focus:ring-1 focus:ring-primary/20"
                            placeholder="Enter password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete={type === 'signup' ? "new-password" : "current-password"}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3 p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Password (Signup Step 1 only) */}
            {type === 'signup' && step === 1 && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary">
                        Confirm Password
                    </label>
                    <input
                        className="w-full rounded-xl bg-bg-card border border-border px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary/70 focus:ring-1 focus:ring-primary/20"
                        placeholder="Re-enter password"
                        type={showPassword ? "text" : "password"}
                        name="confirm-password"
                        autoComplete="new-password"
                        value={formData["confirm-password"]}
                        onChange={handleChange}
                        required
                    />
                </div>
            )}

            {/* SIGNUP STEP 2: OTP Verification Card */}
            {type === 'signup' && step === 2 && (
                <div className="flex flex-col gap-4">
                    {/* Header info badge */}
                    <div className="p-3.5 rounded-xl bg-bg-card border border-border flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                <Mail size={15} className="text-primary" />
                                <span>Verification code sent to:</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setLocalError(null);
                                }}
                                className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                            >
                                Edit email
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-text-primary truncate">
                            {formData.email}
                        </p>
                    </div>

                    {/* Notification on success */}
                    {otpSentNotice && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            <CheckCircle2 size={15} className="shrink-0" />
                            <span>Verification code sent to your email!</span>
                        </div>
                    )}

                    {/* Dev Mode Tip */}
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-text-secondary text-[11px] leading-relaxed">
                        <KeyRound size={14} className="text-primary shrink-0 mt-0.5" />
                        <span>Enter the 6-digit code. In development, check your backend server console for the OTP code.</span>
                    </div>

                    {/* 6 Digit Inputs */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-secondary">
                            6-Digit Verification Code
                        </label>
                        <div className="flex justify-between items-center gap-1.5 sm:gap-2">
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={index === 0 ? handleOtpPaste : undefined}
                                    className={`flex-1 min-w-0 h-12 text-center text-lg font-bold rounded-xl bg-bg-card border transition-all outline-none ${digit
                                            ? 'border-primary text-text-primary ring-1 ring-primary/40'
                                            : 'border-border text-text-primary focus:border-primary/70 focus:ring-1 focus:ring-primary/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Resend OTP */}
                    <div className="flex items-center justify-between text-xs px-0.5">
                        <span className="text-text-muted">Didn't receive code?</span>
                        {resendTimer > 0 ? (
                            <span className="text-text-muted font-medium">
                                Resend in {formatTimer(resendTimer)}
                            </span>
                        ) : (
                            <button
                                type="button"
                                disabled={sendingOtp}
                                onClick={handleResendOtp}
                                className="text-primary hover:underline font-semibold cursor-pointer flex items-center gap-1 disabled:opacity-50"
                            >
                                <RotateCw size={12} className={sendingOtp ? "animate-spin" : ""} />
                                <span>{sendingOtp ? "Sending..." : "Resend code"}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Error Message Alert */}
            {activeError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{activeError}</span>
                </div>
            )}

            {/* Primary Submit Button */}
            <button
                type="submit"
                disabled={loading || sendingOtp || (type === 'signup' && step === 1 && resendTimer > 0)}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-md shadow-primary/25 hover:shadow-primary/40 active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
                {loading || sendingOtp ? (
                    <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : type === 'login' ? (
                    <>
                        <span>Sign in to workspace</span>
                        <ArrowRight size={16} />
                    </>
                ) : step === 1 ? (
                    resendTimer > 0 ? (
                        <span>Retry in {formatTimer(resendTimer)}</span>
                    ) : (
                        <>
                            <span>Continue to Verification</span>
                            <ArrowRight size={16} />
                        </>
                    )
                ) : (
                    <>
                        <span>Verify & Create Account</span>
                        <ArrowRight size={16} />
                    </>
                )}
            </button>

            {/* Back Button on Step 2 */}
            {type === 'signup' && step === 2 && (
                <button
                    type="button"
                    onClick={() => {
                        setStep(1);
                        setLocalError(null);
                    }}
                    className="w-full py-2 px-4 rounded-xl border border-border hover:bg-bg-card text-text-secondary hover:text-text-primary text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                    <ArrowLeft size={14} />
                    <span>Back to edit details</span>
                </button>
            )}
        </form>
    );
}

export default AuthForm;