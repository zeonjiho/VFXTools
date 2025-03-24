import React from 'react'
import styles from './AppLayout.module.css'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className={styles.super_wrap}>
            <div className={styles.color_wrap}>
                <div className={styles.wrap}>
                    <div className={styles.logo_wrap}>
                        <h1 onClick={() => navigate('/')}>Arts</h1>
                        <div className={styles.powered_wrap}>
                            <p>Powered by <a className={styles.hyper_link} href="https://hyper.bz" target="_blank" rel="noopener noreferrer"> HYPER</a></p>
                        </div>
                    </div>
                    <div className={styles.nav_wrap}>
                        <p 
                            className={isActive('/') ? styles.active : ''} 
                            onClick={() => navigate('/')}
                        >
                            Home
                        </p>
                        <p 
                            className={isActive('/camera-database') ? styles.active : ''} 
                            onClick={() => navigate('/camera-database')}
                        >
                            Cameras
                        </p>
                        {/* <p 
                            className={isActive('/lens-calculator') ? styles.active : ''} 
                            onClick={() => navigate('/lens-calculator')}
                        >
                            Lens Calculator
                        </p> */}
                        <p 
                            className={isActive('/plugins') ? styles.active : ''} 
                            onClick={() => navigate('/plugins')}
                        >
                            Plugins
                        </p>
                    </div>
                    <div className={styles.login_btn_wrap}>
                        <p onClick={() => navigate('/login')}>Login</p>
                    </div>
                </div>
            </div>
            <main className={styles.main_content}>
                <Outlet />
            </main>
            <div className={styles.footer_wrap}>
                <p>© 2025 HEIMLICH. All rights reserved.</p>
            </div>
        </div>
    )
}

export default AppLayout