import Link from 'next/link'

import commonStyles from '../../styles/common.module.scss'
import styles from './header.module.scss'

export default function Header() {
  return (
    <header>
      <div className={`${commonStyles.container} ${styles.headerContainer}`}>
        <Link href="/">
          <a><img src="/logo.svg" alt="logo" /></a>
        </Link>
      </div>
    </header>
  )
}
