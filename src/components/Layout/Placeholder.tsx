import React from 'react';
import styles from './Placeholder.module.css';

interface Props {
	gridArea?: string;
}

const Placeholder: React.FC<Props> = (gridArea) => {
	return <div className={`${styles.element} ${gridArea}`} />;
};

export default Placeholder;
