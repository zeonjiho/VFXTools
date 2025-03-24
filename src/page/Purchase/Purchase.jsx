import React from 'react';
import styles from './Purchase.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const Purchase = () => {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            features: [
                '기본 기능 사용',
                '광고 포함',
                '기본 지원'
            ],
            isPopular: false
        },
        {
            name: 'Pro',
            price: '$4.99',
            features: [
                '모든 기능 사용',
                '광고 제거',
                '우선 지원',
                '추가 기능 업데이트'
            ],
            isPopular: true
        }
    ];

    const handlePurchase = (plan) => {
        // TODO: 실제 결제 시스템 연동
        console.log(`Purchasing ${plan.name} plan`);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>프리미엄 구독</h1>
                <p>더 나은 경험을 위한 프리미엄 기능을 구독하세요</p>
            </header>

            <div className={styles.plansContainer}>
                {plans.map((plan, index) => (
                    <div 
                        key={index} 
                        className={`${styles.planCard} ${plan.isPopular ? styles.popular : ''}`}
                    >
                        {plan.isPopular && (
                            <div className={styles.popularBadge}>인기</div>
                        )}
                        <h2 className={styles.planName}>{plan.name}</h2>
                        <div className={styles.price}>
                            <span className={styles.amount}>{plan.price}</span>
                            <span className={styles.period}>/월</span>
                        </div>
                        <ul className={styles.features}>
                            {plan.features.map((feature, idx) => (
                                <li key={idx}>
                                    <FontAwesomeIcon 
                                        icon={faCheck} 
                                        className={styles.checkIcon} 
                                    />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button 
                            className={`${styles.purchaseButton} ${plan.isPopular ? styles.popularButton : ''}`}
                            onClick={() => handlePurchase(plan)}
                        >
                            {plan.name === 'Free' ? '현재 사용 중' : '구독하기'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Purchase; 