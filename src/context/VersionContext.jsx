import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const VersionContext = createContext();

export const useVersion = () => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error("useVersion must be used within a VersionProvider");
  }
  return context;
};

export const VersionProvider = ({ children }) => {
  const CURRENT_VERSION = 19;
  const [verificadorVersion, setVerificadorVersion] = useState(false);

  const checkVersion = async () => {
    try {
      const res = await axios.get("https://api.cbinformatica.net:9072/versionPEINADOSAGENDA");
      if (res.data.ver > CURRENT_VERSION) {
        Swal.fire({
          title: "Actualización",
          text: `Favor de actualizar sitio, hemos detectado una versión anterior`,
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Actualizar",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        setVerificadorVersion(true);
      } else {
        setVerificadorVersion(false);
      }
    } catch (error) {
      console.error("Error checking version:", error);
    }
  };

  useEffect(() => {
    checkVersion();
    const interval = setInterval(checkVersion, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <VersionContext.Provider value={{ CURRENT_VERSION, verificadorVersion, checkVersion }}>
      {children}
    </VersionContext.Provider>
  );
};
