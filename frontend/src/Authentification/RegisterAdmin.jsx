import React, { useState } from "react";
import axios from "axios";
import "../Authentification/RegisterAdmin.css";
import newImage from "/assets/panneau-solaire.jpeg";

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/users/register-admin/", {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      setVerificationSent(true);
      setError(null);
      setSuccess("Verification code sent! Please check your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send verification code.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!verificationSent) {
      setError("Please request a verification code first.");
      return;
    }

    try {
      const verifyResponse = await axios.post("http://127.0.0.1:8000/users/verify-admin/", {
        email: formData.email,
        code: formData.verificationCode,
      });

      if (verifyResponse.status === 200) {
        setSuccess("Account verified and registered successfully!");
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid verification code.");
      return;
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-image">
          <img src={newImage} alt="Solar Panels" />
        </div>

        <div className="register-form">
          <div className="form-container">
            <div className="form-header">
              <h1> Inscription administrateur</h1>
              <p>Entrez vos coordonnées pour créer un compte administrateur</p>
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleSubmit}>
              <input type="text" name="firstName" placeholder="Nom" onChange={handleChange} required />
              <input type="text" name="lastName" placeholder="Prénom" onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required />

              <div className="verification-container">
                <input type="text" name="verificationCode" className="verification-input" placeholder="Entrer ton code " onChange={handleChange} required />
                <button type="button" className="send-code-button" onClick={handleSendCode}>envoyer code</button>
              </div>

              <input type="password" name="password" placeholder="mot de passe" onChange={handleChange} required />
              <input type="password" name="confirmPassword" placeholder="Confirme mot de passe" onChange={handleChange} required />

              <button type="submit" className="submit-button">s'inscrire</button>

              <p className="sign-in-link">Vous avez déjà un compte? <a href="/">se connecter</a></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
