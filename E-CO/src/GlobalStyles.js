import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body, html {
    font-family: 'Barlow', sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  // Ajoutez ici d'autres styles globaux si nécessaire
`;

export default GlobalStyles;