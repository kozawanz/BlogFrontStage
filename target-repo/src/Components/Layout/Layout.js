import React, {ReactNode} from 'react';
import { Header } from './header';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({children}) => {
  return (
    <div className="layout-wrapper">
      <Header />
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <footer />
    </div>
  );
}

export { Layout }