// components/Header.js
import Link from 'next/link';
import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.navbar}>
      <div className={styles.spacer} />
      <div className={styles.logo}>QuickQuote</div>
      <nav className={styles.menu}>
        <Link href="/login">Login</Link>
      </nav>
    </header>
  );
}
