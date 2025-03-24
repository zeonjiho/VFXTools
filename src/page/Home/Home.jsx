import React from 'react'
import styles from './Home.module.css'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faRuler, faLightbulb, faArrowRight, faFileSignature, faClock, faCrown } from '@fortawesome/free-solid-svg-icons'

const Home = () => {
    const navigate = useNavigate()

    const features = [
        {
            title: 'Camera Sensor Database',
            description: 'Search and compare sensor information from various cameras.',
            path: '/camera-database',
            icon: faCamera
        },
        {
            title: 'File Name Generator',
            description: 'Generate standardized file names for your media files.',
            path: '/filename-generator',
            icon: faFileSignature
        },
        {
            title: 'Render Time Calculator',
            description: 'Calculate estimated render times for your projects.',
            path: '/render-calculator',
            icon: faClock
        },
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