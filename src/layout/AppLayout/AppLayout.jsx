import React, { useState, createContext, useContext } from 'react'
import styles from './AppLayout.module.css'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faUser, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

// 사이드바 컨텍스트 생성
export const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 사이드바 상태 관리
    const [rightSidebarContent, setRightSidebarContent] = useState(null);
    const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
    const [rightSidebarTitle, setRightSidebarTitle] = useState('');
    
    // 사이드바 토글 함수
    const toggleRightSidebar = () => {
        setRightSidebarVisible(prev => !prev);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <SidebarContext.Provider value={{ 
            setRightSidebarContent, 
            setRightSidebarVisible, 
            setRightSidebarTitle,
            rightSidebarVisible
        }}>
            <div className={styles.layout}>
                {/* 왼쪽 사이드바 */}
                <nav className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.logoSection}>
                            <h1 onClick={() => navigate('/')}>Arts</h1>
                            <div className={styles.logoSubtitle}>
                                Studio
                            </div>
                        </div>

                        <div className={styles.poweredBy}>
                            <p>by <a href="https://hyper.bz" target="_blank" rel="noopener noreferrer">HYPER</a></p>
                        </div>
                    </div>

                    <div className={styles.navLinks}>
                        <div 
                            className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
                            onClick={() => navigate('/')}
                        >
                            Home
                        </div>
                        <div 
                            className={`${styles.navItem} ${isActive('/camera-database') ? styles.active : ''}`}
                            onClick={() => navigate('/camera-database')}
                        >
                            Cameras
                        </div>
                        <div 
                            className={`${styles.navItem} ${isActive('/filename-generator') ? styles.active : ''}`}
                            onClick={() => navigate('/filename-generator')}
                        >
                            Filename Generator
                        </div>

                        <div className={`${styles.navItem} ${isActive('/svg23d') ? styles.active : ''}`}
                            onClick={() => navigate('/svg23d')}
                        >
                            SVG23D
                        </div>
                        <div className={`${styles.navItem} ${isActive('/color-palette') ? styles.active : ''}`}
                            onClick={() => navigate('/color-palette')}
                        >
                            Color Palette
                        </div>


-


                        <div 
                            className={`${styles.navItem} ${isActive('/plugins') ? styles.active : ''}`}
                            onClick={() => navigate('/plugins')}
                        >
                            Plugins
                        </div>
                    </div>

                    <div className={styles.sidebarFooter}>
                        <button className={styles.settingsButton}>
                            <FontAwesomeIcon icon={faCog} />
                            <span>Settings</span>
                        </button>
                    </div>
                </nav>

                {/* 메인 컨텐츠 영역 */}
                <div className={`${styles.mainContainer} ${rightSidebarVisible ? styles.withSidebar : ''}`}>
                    {/* 상단 헤더 */}
                    <header className={styles.header}>
                        <div className={styles.headerContent}>
                            <div className={styles.searchBar}>
                                {/* 검색바 구현 예정 */}
                            </div>
                            <div className={styles.userSection}>
                                <button className={styles.profileButton} onClick={() => navigate('/login')}>
                                    <FontAwesomeIcon icon={faUser} />
                                    <span>Login</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* 메인 컨텐츠 */}
                    <main className={styles.mainContent}>
                        <Outlet />
                    </main>

                    {/* 푸터 */}
                    <footer className={styles.footer}>
                        <p>© 2025 HEIMLICH. All rights reserved. Created by <a href="https://instagram.com/zeonjiho" target="_blank" rel="noopener noreferrer">@zeonjiho</a></p>
                    </footer>
                </div>

                {/* 오른쪽 사이드바 */}
                <aside className={`${styles.rightSidebar} ${rightSidebarVisible ? styles.visible : ''}`}>
                    {rightSidebarVisible && (
                        <>
                            <div className={styles.rightSidebarHeader}>
                                <h3>{rightSidebarTitle || '사이드바'}</h3>
                            </div>
                            <div className={styles.rightSidebarContent}>
                                {rightSidebarContent}
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </SidebarContext.Provider>
    )
}

export default AppLayout