import React from 'react';
import { useTheme } from './ThemeContex.jsx';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <motion.button
            className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
        >
            <motion.div
                className="toggle-track"
                animate={{ backgroundColor: isDarkMode ? '#333333' : '#E0E0E0' }}
            >
                <motion.div
                    className="toggle-thumb"
                    animate={{
                        x: isDarkMode ? 28 : 0,
                        backgroundColor: isDarkMode ? '#FFFFFF' : '#333333'
                    }}
                />
                <motion.div
                    className="toggle-icon sun"
                    animate={{ opacity: isDarkMode ? 0 : 1, color: '#333333' }}
                >
                    <FiSun />
                </motion.div>
                <motion.div
                    className="toggle-icon moon"
                    animate={{ opacity: isDarkMode ? 1 : 0, color: '#FFFFFF' }}
                >
                    <FiMoon />
                </motion.div>
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;