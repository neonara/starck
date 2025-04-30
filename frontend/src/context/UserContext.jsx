import { createContext, useContext, useState, useEffect } from "react";
 
const UserContext = createContext();
 
export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
 
  const updateRole = (newRole) => {
    if (newRole) {
      localStorage.setItem("role", newRole);
    } else {
      localStorage.removeItem("role");
    }
    setRole(newRole);
  };
 
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);
 
  return (
<UserContext.Provider value={{ role, updateRole }}>
      {children}
</UserContext.Provider>
  );
};
 
export const useUser = () => useContext(UserContext);