import React from 'react'
import styles from './Home.module.css'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faRuler, faLightbulb, faArrowRight, faFileSignature, faClock, faCrown, faPalette, faImage } from '@fortawesome/free-solid-svg-icons'

const Home = () => {
    const navigate = useNavigate()

    const features = [
        {
            title: 'Camera Sensor Database',
            description: '다양한 카메라의 센서 정보를 검색하고 비교하세요.',
            path: '/camera-database',
            icon: faCamera
        },
        {
            title: 'File Name Generator',
            description: '미디어 파일을 위한 표준화된 파일명을 생성하세요.',
            path: '/filename-generator',
            icon: faFileSignature
        },
        {
            title: 'Render Time Calculator',
            description: '프로젝트의 예상 렌더 시간을 계산하세요.',
            path: '/render-calculator',
            icon: faClock
        },
        {
            title: 'Color Palette Extractor',
            description: '이미지에서 컬러 팔레트를 추출하세요.',
            path: '/color-palette',
            icon: faPalette
        },
        {
            title: 'SVG Viewer',
            description: 'SVG 파일을 미리보기하고 코드를 확인하세요.',
            path: '/svg-viewer',
            icon: faImage
        }
        // {
        //     title: 'Remove Ads',
        //     description: 'Get premium features and remove ads with Pro subscription.',
        //     path: '/purchase',
        //     icon: faCrown
        // }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>for lovers of Arts</h1>
                    <p className={styles.subtitle}>All-in-one toolkit for film and video production</p>
                </div>
            </header>

            <main className={styles.main}>
                <h2 className={styles.sectionTitle}>Essential Tools</h2>
                <div className={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className={styles.featureCard}
                            onClick={() => navigate(feature.path)}
                        >
                            <div className={styles.featureIconContainer}>
                                <FontAwesomeIcon icon={feature.icon} />
                            </div>
                            <h2 className={styles.featureTitle}>{feature.title}</h2>
                            <p className={styles.featureDescription}>{feature.description}</p>
                            <div className={styles.featureAction}>
                                <span>Explore</span>
                                <FontAwesomeIcon icon={faArrowRight} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Home