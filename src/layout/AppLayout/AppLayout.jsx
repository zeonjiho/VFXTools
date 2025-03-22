import React from 'react'
import styles from './AppLayout.module.css'
import { Outlet, useNavigate } from 'react-router-dom'

const AppLayout = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.super_wrap}>
            <div className={styles.color_wrap}>
                <div className={styles.wrap}>
                    <div className={styles.logo_wrap}>
                        <h1 onClick={() => navigate('/')}>VFXTools</h1>
                    </div>
                    <div className={styles.login_btn_wrap}>
                        <p onClick={() => navigate('/login')}>Login</p>
                    </div>
                </div>
            </div>
            <Outlet />
            <div className={styles.footer_wrap}>
                <p>© 2024 VFXTools. All rights reserved.</p>
            </div>
        </div>
    )
}

export default AppLayout