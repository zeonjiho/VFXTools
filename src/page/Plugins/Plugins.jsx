import React from 'react'
import styles from './Plugins.module.css'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faRuler, faLightbulb, faArrowRight, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons'

const Plugins = () => {
    const navigate = useNavigate()

    const plugins = [
        {
            title: 'Camera Sensor Database',
            description: 'Search and compare sensor information from various cameras.',
            price: 'Free',
            icon: faCamera
        },
        {
            title: 'Orbitools',
            description: 'Orbit tools for After Effects',
            price: '$29',
            icon: faRuler
        },
        // {
        //     title: 'Lighting Calculator',
        //     description: 'Calculate lighting setups and exposure values.',
        //     price: '$29',
        //     icon: faLightbulb
        // }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Premium Plugins</h1>
                    <p className={styles.subtitle}>Professional plugins for film and video production</p>
                </div>
            </header>

            <main className={styles.main}>
                <h2 className={styles.sectionTitle}>Available Plugins</h2>
                <div className={styles.pluginsGrid}>
                    {plugins.map((plugin, index) => (
                        <div 
                            key={index} 
                            className={styles.pluginCard}
                        >
                            <div className={styles.pluginIconContainer}>
                                <FontAwesomeIcon icon={plugin.icon} />
                            </div>
                            <h2 className={styles.pluginTitle}>{plugin.title}</h2>
                            <p className={styles.pluginDescription}>{plugin.description}</p>
                            <div className={styles.pluginPrice}>{plugin.price}</div>
                            <button className={styles.purchaseButton}>
                                Purchase
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Plugins 