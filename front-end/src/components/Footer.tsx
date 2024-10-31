import { Copyright } from './copyright/Copyright';
import styles from './Footer.module.scss';
import { Socials } from './socials/Socials';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Socials />
      <Copyright />
    </footer>
  );
}
