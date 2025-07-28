import LogoWhite from '../assets/logo_white.png';
import LogoBlack from '../assets/logo_black.png';

export function getImage() {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') {
    return LogoBlack;
  }
  return LogoWhite;
}
