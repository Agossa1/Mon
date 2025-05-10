import React, { useState, useEffect } from 'react';
import MobileHeader from './MobileHeader';
import TabletHeader from './TabletteHeaders';
import DesktopHeader from './DesktopHeader';
import OffcanvasMenu from './OffcanvasMenu';

const Header = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDeviceType('mobile');
      } else if (window.innerWidth < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOffcanvasClose = () => {
    setShowOffcanvas(false);
    setTimeout(() => setShowOverlay(false), 300); // Délai pour l'animation de fermeture
  };

  const handleOffcanvasShow = () => {
    setShowOverlay(true);
    setShowOffcanvas(true);
  };

  return (
    <>
      {deviceType === 'mobile' && <MobileHeader handleOffcanvasShow={handleOffcanvasShow} />}
      {deviceType === 'tablet' && <TabletHeader handleOffcanvasShow={handleOffcanvasShow} />}
      {deviceType === 'desktop' && <DesktopHeader handleOffcanvasShow={handleOffcanvasShow} />}

      <OffcanvasMenu isOpen={showOffcanvas} onClose={handleOffcanvasClose} />
      
           {/* Overlay transparent */}
        <div
          className={`overlay ${showOverlay ? 'show' : ''}`}
          onClick={handleOffcanvasClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1040,
            transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
            opacity: showOverlay ? 1 : 0,
            visibility: showOverlay ? 'visible' : 'hidden',
          }}
        />
    </>
  );
};

export default Header;