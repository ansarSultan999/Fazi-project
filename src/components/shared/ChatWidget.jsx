// src/components/TawkToWidget.jsx
import { useEffect } from "react";

const TawkToWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/68737507627dca190e376147/1j01g2aa6";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);

    return () => {
      // Optional: cleanup on unmount
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default TawkToWidget;
