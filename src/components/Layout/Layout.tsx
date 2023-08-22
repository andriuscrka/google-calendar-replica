import React, { ReactNode } from 'react';
import styles from './Layout.module.css';

interface Props {
	children?: ReactNode;
}

const Layout: React.FC<Props> = (props): JSX.Element => {
	return (
		<div className={styles.contentWrap}>
			{props.children &&
				React.Children.map(
					props.children,
					(element, index: number): ReactNode => {
						if (React.isValidElement(element)) {
							return (
								<div className={styles[element.props.gridArea]} key={index}>
									{element}
								</div>
							);
						} else {
							throw new Error(
								'Layout module had problems rendering page elements'
							);
						}
					}
				)}
		</div>
	);
};

export default Layout;
