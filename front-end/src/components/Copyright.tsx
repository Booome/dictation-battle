import styles from './Copyright.module.scss';

export function Copyright() {
  const year = new Date().getFullYear();

  return <small className={styles.copyright}>&copy; {year} Gear Foundation, Inc. All rights reserved.</small>;
}
