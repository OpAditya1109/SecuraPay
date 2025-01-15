import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // import toast for notifications
import "react-toastify/dist/ReactToastify.css"; // import styles
import "../CSS/Signup.css";

const Signup = () => {
  const [SignupInfo, setSignupInfo] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false); // New state to track loading status
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, username, email, password, phone } = SignupInfo;

    if (!name || !username || !email || !password || !phone) {
      return toast.error("All fields are required!");
    }

    setLoading(true); // Start loading

    try {
      // Step 1: Sign up the user (create account)
      const url = `${process.env.REACT_APP_API_URL}/auth/signup`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(SignupInfo),
      });

      const result = await response.json();
      console.log(result); // Log the result to check the response from signup API

      const { success, message } = result;

      if (success) {
        // Step 2: Send OTP to the user's email
        const otpResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/send-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }), // Send email to send OTP
          }
        );

        const otpResult = await otpResponse.json();
        console.log(otpResult); // Log the OTP result

        if (otpResult.message === "OTP sent to your email") {
          toast.success("Signup successful! Please verify your OTP.");
          setTimeout(() => {
            navigate("/otp-verification", { state: { email } }); // Pass email for OTP verification
          }, 1000);
        } else {
          toast.error(
            otpResult.error || "Error sending OTP. Please try again."
          );
        }
      } else {
        toast.error(message || "Signup failed!");
      }
    } catch (err) {
      console.error(err); // Log the error
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="container-body">
      <div className="container">
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              autoFocus
              placeholder="Enter Your Name ..."
              value={SignupInfo.name}
            />
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <input
              onChange={handleChange}
              type="text"
              name="username"
              autoFocus
              placeholder="Enter Your Username ..."
              value={SignupInfo.username}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter Your Email ..."
              value={SignupInfo.email}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter Your Password ..."
              value={SignupInfo.password}
            />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input
              onChange={handleChange}
              type="number"
              name="phone"
              placeholder="Enter Your Phone No ..."
              value={SignupInfo.phone}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? (
              <span className="loader"></span> // Show a loader if loading is true
            ) : (
              "Signup"
            )}
          </button>
          <div className="already-account">
            <span>
              Already Have an Account? <Link to="/login">Login</Link>
            </span>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
