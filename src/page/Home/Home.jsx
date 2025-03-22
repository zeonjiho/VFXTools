import React from 'react'
import styles from './Home.module.css'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faRuler, faLightbulb, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const Home = () => {
    const navigate = useNavigate()

    const features = [
        {
            title: 'Camera Sensor Database',
            description: 'Search and compare sensor information from various cameras.',
            path: '/camera-database',
            icon: faCamera
        },
        // {
        //     title: 'Lens Calculator',
        //     description: 'Calculate field of view based on focal length and sensor size.',
        //     path: '/lens-calculator',
        //     icon: faRuler
        // },
        // {
        //     title: 'Lighting Calculator',
        //     description: 'Calculate lighting setups and exposure values.',
        //     path: '/lighting-calculator',
        //     icon: faLightbulb
        // }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>VFX Wiki</h1>
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

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <p className={styles.copyright}>© 2024 VFX Wiki. All rights reserved.</p>
                    <div className={styles.footerLinks}>
                        <a href="#">About</a>
                        <a href="#">Contact</a>
                        <a href="#">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home