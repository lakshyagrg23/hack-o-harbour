import React, { useState } from "react";
import { motion } from "framer-motion";

function EmailWiseConnect({ setAuthenticated }) {
    const [loading, setLoading] = useState(false);

    const startOAuthFlow = async () => {
        setLoading(true);
        const response = await fetch("http://localhost:5000/auth/url");
        const { authUrl } = await response.json();
        window.location.href = authUrl;
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-900">
            {/* Slower Background Gradient Animation */}
            <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "300% 300%" }}
            ></motion.div>

            {/* Soft Floating Glows */}
            <motion.div 
                className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full opacity-30 blur-[100px]"
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
                className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full opacity-40 blur-[150px]"
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.15, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden"
            >
                {/* Left Side - Hero Section */}
                <div className="flex-1 p-10 flex flex-col justify-center text-white bg-gradient-to-r from-indigo-600 to-blue-500">
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-4xl font-extrabold mb-4"
                    >
                        Welcome to <span className="text-yellow-300">EmailWise AI</span>
                    </motion.h1>
                    <p className="text-lg mb-6 opacity-90">
                        Elevate your inbox with <strong>AI-powered email categorization.</strong>  
                        Experience a <strong>smarter</strong>, <strong>faster</strong>, and <strong>intelligent</strong> way to organize your emails.
                    </p>
                    <p className="text-sm opacity-80">
                        🔒 <strong>Privacy First:</strong> We never store your emails—your data stays yours.
                    </p>
                </div>

                {/* Right Side - OAuth Login */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-center bg-white/20 p-6 rounded-lg shadow-lg backdrop-blur-lg"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-200">Connect Your Gmail</h2>
                        <p className="text-gray-300 mb-6">
                            Unlock <strong>AI-powered organization</strong> in just one click.
                        </p>

                        {/* Google Sign-in Button */}
                        <motion.button
                            onClick={startOAuthFlow}
                            disabled={loading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="relative inline-flex items-center justify-center bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <motion.svg
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="h-5 w-5 mr-2"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                                    </motion.svg>
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <img src="https://img.icons8.com/?size=100&id=17950&format=png&color=000000" alt="Google Logo" className="w-5 h-5 mr-2" />
                                    Continue with Google
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

export default EmailWiseConnect;
