import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'

const Login = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: 로그인 로직 구현
        console.log('Login attempt:', formData)
    }

    return (
        <div className={styles.login_container}>
            <div className={styles.login_box}>
                <h2>Welcome Back</h2>
                <p className={styles.subtitle}>Please sign in to continue</p>
                
                <form onSubmit={handleSubmit} className={styles.login_form}>
                    <div className={styles.form_group}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    
                    <div className={styles.form_group}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className={styles.form_options}>
                        <label className={styles.remember_me}>
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className={styles.forgot_password}>Forgot password?</a>
                    </div>

                    <button type="submit" className={styles.login_button}>
                        Sign In
                    </button>

                    <div className={styles.signup_link}>
                        Don't have an account? <a href="#">Sign up</a>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login