import React, { useState, createContext, useContext, useRef, useEffect } from 'react'
import styles from './AppLayout.module.css'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faUser, faChevronLeft, faChevronRight, faSearch, faGripLinesVertical } from '@fortawesome/free-solid-svg-icons'

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
    const [rightSidebarWidth, setRightSidebarWidth] = useState(300); // 기본 너비
    const [isResizing, setIsResizing] = useState(false);
    
    // ref 객체 생성
    const rightSidebarRef = useRef(null);
    const resizingRef = useRef(false);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    
    // 사이드바 토글 함수
    const toggleRightSidebar = () => {
        setRightSidebarVisible(prev => !prev);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };
    
    // 리사이징 시작 핸들러
    const startResizing = (e) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.body.classList.add('is-resizing');
        
        resizingRef.current = true;
        startXRef.current = e.clientX;
        startWidthRef.current = rightSidebarWidth;
        setIsResizing(true);
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResizing);
    };
    
    // 리사이징 핸들러
    const resize = (e) => {
        if (!resizingRef.current) return;
        
        // 마우스 위치 변화량 계산
        const dx = startXRef.current - e.clientX;
        
        // 새 너비 계산 (마우스가 왼쪽으로 이동하면 사이드바 너비 증가)
        const newWidth = startWidthRef.current + dx;
        
        // 최소 너비와 최대 너비 제한
        if (newWidth > 200 && newWidth < 600) {
            setRightSidebarWidth(newWidth);
            if (rightSidebarRef.current) {
                rightSidebarRef.current.style.width = `${newWidth}px`;
            }
        }
    };
    
    // 리사이징 종료 핸들러
    const stopResizing = () => {
        document.body.style.removeProperty('cursor');
        document.body.style.removeProperty('user-select');
        document.body.classList.remove('is-resizing');
        
        resizingRef.current = false;
        setIsResizing(false);
        
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResizing);
    };
    
    // 마운트 해제 시 이벤트 리스너 제거
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResizing);
        };
    }, []);

    return (
        <SidebarContext.Provider value={{ 
            setRightSidebarContent, 
            setRightSidebarVisible, 
            setRightSidebarTitle,
            rightSidebarVisible,
            toggleRightSidebar
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
                        <div className={styles.navItemGroup}>
                            <h3>Essential</h3>
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
                        <div className={`${styles.navItem} ${isActive('/color-palette') ? styles.active : ''}`}
                            onClick={() => navigate('/color-palette')}
                        >
                            Color Palette
                        </div>
                        
                        {/* <div className={`${styles.navItem} ${isActive('/fov-calculator') ? styles.active : ''}`}
                            onClick={() => navigate('/story')}
                        >
                            Story Board
                        </div>
                        <div className={`${styles.navItem} ${isActive('/plugins') ? styles.active : ''}`}
                            onClick={() => navigate('/ratio-calculator')}
                        >
                            Ratio Calculator
                        </div> */}
                        <div className={styles.navItem}
                                onClick={() => navigate('/story')}
                            >
                                Story Board
                            </div>


                        <div className={styles.navItemGroup}>
                            <h3>Tools</h3>
                        </div>
                        <div className={`${styles.navItem} ${isActive('/svg23d') ? styles.active : ''}`}
                            onClick={() => navigate('/svg23d')}
                        >
                            SVG23D
                        </div>
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
                                {location.pathname === '/camera-database' && (
                                    <button 
                                        className={`${styles.sidebarToggleButton} ${rightSidebarVisible ? styles.active : ''}`}
                                        onClick={toggleRightSidebar}
                                        title={rightSidebarVisible ? "사이드바 닫기" : "카메라 모델 목록 열기"}
                                    >
                                        <FontAwesomeIcon icon={rightSidebarVisible ? faChevronRight : faChevronLeft} />
                                        <span>{rightSidebarVisible ? "모델 목록 닫기" : "모델 목록 열기"}</span>
                                    </button>
                                )}
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
                <aside 
                    className={`${styles.rightSidebar} ${rightSidebarVisible ? styles.visible : ''}`}
                    ref={rightSidebarRef}
                    style={{ width: `${rightSidebarWidth}px` }}
                >
                    {/* 리사이저 핸들 */}
                    <div 
                        className={`${styles.resizer} ${isResizing ? styles.isResizing : ''}`}
                        onMouseDown={startResizing}
                    >
                        <FontAwesomeIcon icon={faGripLinesVertical} className={styles.resizerIcon} />
                    </div>
                    <div className={styles.rightSidebarHeader}>
                        <h3>{rightSidebarTitle || '사이드바'}</h3>
                        <button className={styles.closeSidebarButton} onClick={toggleRightSidebar}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                    <div className={styles.rightSidebarContent}>
                        {rightSidebarContent}
                    </div>
                </aside>
            </div>
        </SidebarContext.Provider>
    )
}

export default AppLayout